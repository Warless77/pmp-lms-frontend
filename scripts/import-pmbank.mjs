#!/usr/bin/env node
/*
 * Extracts the three structured PMP domain PDFs from PMBOOK.zip into a
 * reviewable JSON or CSV file. It intentionally does not publish records:
 * answer keys need a human review before they are used in scored exams.
 *
 * Usage:
 *   node scripts/import-pmbank.mjs --archive /path/to/PMBOOK.zip --out ./pmp-question-candidates.csv
 *
 * Requires the system commands `unzip` and `pdftotext`.
 */
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const execFileAsync = promisify(execFile);
const sources = [
  { domain: 'people', file: 'QUESTION BANK/pdf Q for domains/PEOPLE.pdf' },
  { domain: 'process', file: 'QUESTION BANK/pdf Q for domains/PROCESS.pdf' },
  { domain: 'business', file: 'QUESTION BANK/pdf Q for domains/BUSINESS.pdf' }
];

function optionScore(option, explanation) {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'for', 'is', 'are', 'that', 'this', 'with', 'on', 'by', 'be', 'as', 'it', 'from', 'will', 'should', 'can', 'project', 'manager']);
  const terms = (value) => new Set((value.toLowerCase().match(/[a-z]{3,}/g) || []).filter((word) => !stopWords.has(word)));
  const optionTerms = terms(option);
  const explanationTerms = terms(explanation.slice(0, 500));
  if (!optionTerms.size) return 0;
  let matches = 0;
  optionTerms.forEach((term) => { if (explanationTerms.has(term)) matches += 1; });
  return matches / optionTerms.size;
}

function inferAnswer(options, explanation) {
  const explicit = explanation.match(/(?:the )?(?:correct|right|best) answer is (?:option )?([A-E])\b/i);
  if (explicit) return { indices: [explicit[1].toUpperCase().charCodeAt(0) - 65], confidence: 1 };

  const scores = options.map((option) => optionScore(option, explanation));
  const ordered = scores.map((score, index) => ({ score, index })).sort((a, b) => b.score - a.score);
  if (ordered[0]?.score >= 0.72 && ordered[0].score - (ordered[1]?.score || 0) >= 0.18) {
    return { indices: [ordered[0].index], confidence: Number(ordered[0].score.toFixed(3)) };
  }
  return { indices: [], confidence: 0 };
}

function normalise(value) {
  return value.replace(/\f/g, '\n').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function parseDocument(text, domain) {
  const clean = normalise(text).replace(/\nPage \d+ of \d+\n/g, '\n');
  const blocks = clean.split(/(?=^\d+\.\s)/m).filter((block) => /^\d+\.\s/.test(block));

  return blocks.map((block, sequence) => {
    const number = block.match(/^(\d+)\.\s/)?.[1];
    const optionMatches = [...block.matchAll(/^([A-E])\.\s+(.+)$/gm)];
    if (optionMatches.length < 2) return null;
    const prompt = block.slice(0, optionMatches[0].index).replace(/^\d+\.\s/, '').replace(/\n/g, ' ').trim();
    const lastOption = optionMatches.at(-1);
    const lastOptionRemainder = block.slice(lastOption.index + lastOption[0].length)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    // In these PDFs the explanation starts on a new capitalised line; wrapped
    // option text continues on lower-case lines. Preserve uncertain records for
    // review rather than guessing a key when this layout cannot be recognised.
    const explanationStart = lastOptionRemainder.findIndex((line) => /^[A-Z]/.test(line));
    const lastOptionContinuation = explanationStart === -1 ? lastOptionRemainder : lastOptionRemainder.slice(0, explanationStart);
    const explanation = (explanationStart === -1 ? [] : lastOptionRemainder.slice(explanationStart))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const options = optionMatches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = index + 1 < optionMatches.length ? optionMatches[index + 1].index : lastOption.index + lastOption[0].length;
      const continuation = index + 1 === optionMatches.length ? lastOptionContinuation.join(' ') : block.slice(start, end);
      return `${match[2]} ${continuation}`
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    });
    if (prompt.length < 40 || !explanation) return null;
    const answer = inferAnswer(options, explanation);
    return {
      // Source numbering is not unique in every supplied PDF, so include the
      // extracted sequence as a stable, import-safe identifier.
      source_id: `pmbank-${domain}-${number}-${sequence + 1}`,
      domain,
      question_text: prompt,
      options,
      // correct_index is required by the existing table. An unverified value
      // is harmless because every imported record is unpublished and requires
      // review before learners can retrieve it.
      correct_index: answer.indices.length === 1 ? answer.indices[0] : 0,
      explanation,
      difficulty: 'medium',
      required_plan: 'premium',
      is_published: false,
      answer_confidence: answer.confidence,
      review_status: 'needs_review',
      published: false,
      source_reference: `${domain.toUpperCase()}.pdf question ${number} (extracted item ${sequence + 1})`
    };
  }).filter(Boolean);
}

async function extractPdfText(archive, file) {
  const { stdout: pdf } = await execFileAsync('unzip', ['-p', archive, file], { encoding: 'buffer', maxBuffer: 32 * 1024 * 1024 });
  return new Promise((resolveText, reject) => {
    const converter = spawn('pdftotext', ['-', '-']);
    const chunks = [];
    const errors = [];
    converter.stdout.on('data', (chunk) => chunks.push(chunk));
    converter.stderr.on('data', (chunk) => errors.push(chunk));
    converter.on('error', reject);
    converter.on('close', (code) => {
      if (code !== 0) return reject(new Error(Buffer.concat(errors).toString() || `pdftotext exited with ${code}`));
      resolveText(Buffer.concat(chunks).toString('utf8'));
    });
    converter.stdin.end(pdf);
  });
}

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function csvCell(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function asCsv(questions) {
  const columns = [
    'source_id', 'domain', 'difficulty', 'question_text', 'options',
    'correct_index', 'explanation', 'required_plan', 'is_published',
    'answer_confidence', 'review_status', 'source_reference'
  ];
  return `${columns.join(',')}\n${questions.map((question) => columns.map((column) => csvCell(question[column])).join(',')).join('\n')}\n`;
}

const archive = option('--archive');
const output = option('--out');
const skip = Number(option('--skip') || 0);
if (!archive || !output) {
  console.error('Usage: node scripts/import-pmbank.mjs --archive /path/to/PMBOOK.zip --out /path/to/questions.csv [--skip number]');
  process.exit(1);
}
if (!Number.isInteger(skip) || skip < 0) {
  console.error('--skip must be a non-negative whole number');
  process.exit(1);
}

const questions = [];
for (const source of sources) {
  const text = await extractPdfText(resolve(archive), source.file);
  questions.push(...parseDocument(text, source.domain));
}
const selectedQuestions = questions.slice(skip);

const payload = {
  generated_at: new Date().toISOString(),
  source: 'PMBOOK.zip structured domain PDFs',
  question_count: selectedQuestions.length,
  questions: selectedQuestions
};
await mkdir(dirname(resolve(output)), { recursive: true });
const outputPath = resolve(output);
await writeFile(outputPath, outputPath.endsWith('.csv') ? asCsv(selectedQuestions) : `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${selectedQuestions.length} review candidates to ${resolve(output)}`);
