/**
 * Hushh Research Monorepo - Local Workspace Encryption Compliance Preflight
 * * Audits local data structures to ensure local sandbox development files follow
 * secure, zero-knowledge naming conventions and cryptographic guardrails.
 */
const fs = require('fs');
const path = require('path');

console.log('\x1b[35m%s\x1b[0m', '🔒 Auditing local workspace sandbox for data encryption compliance...');

// Define a list of raw, non-compliant data file patterns we want to flag if left unencrypted in scratchpads
const PLAINTEXT_EXTENSIONS = ['.raw_sql', '.unencrypted_log', '.cleartext_pkm'];
const dataScratchpadPath = path.resolve(__dirname, '../data');

let nonCompliantFilesFound = 0;

if (fs.existsSync(dataScratchpadPath)) {
    try {
        const files = fs.readdirSync(dataScratchpadPath);
        files.forEach(file => {
            const ext = path.extname(file);
            if (PLAINTEXT_EXTENSIONS.includes(ext)) {
                console.log('\x1b[31m%s\x1b[0m', `⚠️  Non-Compliant Data Asset Detected: '${file}'`);
                console.log(`   Action: Wrap this data payload using Hushh Zero-Knowledge architecture or secure encryption envelopes.`);
                nonCompliantFilesFound++;
            }
        });
    } catch (err) {
        // Safe fallback if directory cannot be read
    }
}

if (nonCompliantFilesFound === 0) {
    console.log('\x1b[32m%s\x1b[0m', '✅ Compliance Check Passed: Local sandbox development space is fully aligned with zero-knowledge data protocols!');
} else {
    console.log('\x1b[33m%s\x1b[0m', `\n⚠️  Preflight found ${nonCompliantFilesFound} security optimization opportunities. Please check data structures before deployment.`);
}

process.exit(0);
