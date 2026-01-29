import path from "path";
import process from "process";
import { uploadFileToIPFS, uploadProofBundle, getIPFSUrl } from "../lib/ipfs-utils.js";

function usage() {
  console.log("Usage:");
  console.log("  node scripts/ipfs-upload.js file <path>");
  console.log("  node scripts/ipfs-upload.js bundle <path1> <path2> ...");
  console.log("");
  console.log("Environment:");
  console.log("  WEB3_STORAGE_TOKEN=... (required)");
}

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (!mode) {
    usage();
    process.exit(1);
  }

  if (mode === "file") {
    const filePath = args[0];
    if (!filePath) {
      usage();
      process.exit(1);
    }
    const cid = await uploadFileToIPFS(filePath, path.basename(filePath));
    console.log(JSON.stringify({ cid, url: getIPFSUrl(cid) }, null, 2));
    return;
  }

  if (mode === "bundle") {
    if (args.length < 1) {
      usage();
      process.exit(1);
    }
    const cid = await uploadProofBundle(args);
    console.log(JSON.stringify({ cid, url: getIPFSUrl(cid) }, null, 2));
    return;
  }

  usage();
  process.exit(1);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
