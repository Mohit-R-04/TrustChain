import { Web3Storage } from 'web3.storage';
import fs from 'fs';
import path from 'path';

/**
 * IPFS Upload Utility using web3.storage
 * Supports: Invoices, Proofs, Reports, Images
 */

// Initialize web3.storage client
function getWeb3StorageClient() {
  const token = process.env.WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error('WEB3_STORAGE_TOKEN environment variable not set. Get one at https://web3.storage');
  }
  return new Web3Storage({ token });
}

/**
 * Upload a file to IPFS via web3.storage
 * @param {string} filePath - Path to the file to upload
 * @param {string} fileName - Name of the file (for metadata)
 * @returns {Promise<string>} - CID (Content Identifier) hash
 */
async function uploadFileToIPFS(filePath, fileName = null) {
  try {
    const client = getWeb3StorageClient();
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const actualFileName = fileName || path.basename(filePath);
    
    // Create a File object
    const file = new File([fileBuffer], actualFileName, { type: 'application/octet-stream' });
    
    console.log(`📤 Uploading ${actualFileName} to IPFS...`);
    const cid = await client.put([file], {
      name: actualFileName,
      maxRetries: 3,
    });

    console.log(`✅ Uploaded successfully! CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error(`❌ IPFS Upload Error: ${error.message}`);
    throw error;
  }
}

/**
 * Upload vendor quotation (PDF/JSON)
 * @param {string} quotationPath - Path to quotation file
 * @returns {Promise<string>} - CID hash
 */
async function uploadQuotation(quotationPath) {
  return uploadFileToIPFS(quotationPath, 'quotation');
}

/**
 * Upload proof documents (photos, invoices, reports)
 * @param {string[]} proofFiles - Array of file paths
 * @returns {Promise<string>} - Single CID for all files (creates a folder)
 */
async function uploadProofBundle(proofFiles) {
  try {
    const client = getWeb3StorageClient();
    
    const files = proofFiles.map((filePath) => {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      return new File([fileBuffer], fileName, { type: 'application/octet-stream' });
    });

    console.log(`📤 Uploading ${files.length} proof files to IPFS...`);
    const cid = await client.put(files, {
      name: 'milestone-proofs',
      maxRetries: 3,
    });

    console.log(`✅ Proof bundle uploaded! CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error(`❌ Proof Upload Error: ${error.message}`);
    throw error;
  }
}

/**
 * Retrieve IPFS file URL for verification
 * @param {string} cid - Content Identifier hash
 * @returns {string} - IPFS gateway URL
 */
function getIPFSUrl(cid) {
  return `https://w3s.link/ipfs/${cid}`;
}

/**
 * Verify IPFS hash authenticity by checking if it's accessible
 * @param {string} cid - Content Identifier hash
 * @returns {Promise<boolean>} - True if CID is accessible
 */
async function verifyIPFSHash(cid) {
  try {
    const url = getIPFSUrl(cid);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`❌ IPFS verification failed for ${cid}: ${error.message}`);
    return false;
  }
}

export {
  uploadFileToIPFS,
  uploadQuotation,
  uploadProofBundle,
  getIPFSUrl,
  verifyIPFSHash,
};
