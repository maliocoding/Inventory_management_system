import { spawn, spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "playwright";

const HOST = process.env.SCREENSHOT_HOST ?? "localhost";
const PORT = Number(process.env.SCREENSHOT_PORT ?? 3000);
const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? `http://${HOST}:${PORT}`;
const USE_EXISTING_SERVER = process.env.SCREENSHOT_USE_EXISTING_SERVER === "1";

const targets = [
  {
    route: "/dashboard",
    heading: "Inventory Overview",
    output: "public/dashboard-preview.png",
  },
  {
    route: "/products",
    heading: "Product Directory",
    output: "public/feature-previews/products-preview.png",
  },
  {
    route: "/categories",
    heading: "Product Categories",
    output: "public/feature-previews/categories-preview.png",
  },
  {
    route: "/locations",
    heading: "Location Inventory",
    output: "public/feature-previews/locations-preview.png",
  },
  {
    route: "/movements",
    heading: "Movement Ledger",
    output: "public/feature-previews/ledger-preview.png",
  },
  {
    route: "/audit",
    heading: "System Audit Events",
    output: "public/feature-previews/audit-preview.png",
  },
];

function startDevServer() {
  const env = {
    ...process.env,
    BETTER_AUTH_URL: BASE_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: BASE_URL,
  };

  const child = spawn(
    "npm",
    ["run", "dev", "--", "--hostname", HOST, "--port", String(PORT)],
    {
      env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    },
  );

  child.stdout.on("data", (buf) => {
    process.stdout.write(`[dev] ${buf}`);
  });
  child.stderr.on("data", (buf) => {
    process.stderr.write(`[dev] ${buf}`);
  });

  return child;
}

async function isServerReachable(url) {
  try {
    const res = await fetch(`${url}/login`, {
      redirect: "manual",
    });
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url, attempts = 120) {
  for (let i = 0; i < attempts; i += 1) {
    const reachable = await isServerReachable(url);
    if (reachable) {
      return;
    }
    await delay(1000);
  }
  throw new Error(`Timed out waiting for dev server at ${url}`);
}

function stopProcessTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/t", "/f"], { stdio: "ignore" });
    return;
  }
  process.kill(-pid, "SIGTERM");
}

async function signUpAndCapture(baseUrl) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
  });
  const page = await context.newPage();

  const unique = Date.now();
  const email = `screenshots+${unique}@example.com`;
  const password = "Capture@123456";

  await page.goto(`${baseUrl}/signup`, { waitUntil: "domcontentloaded" });
  await page.locator("#signup-name").fill("Screenshot Bot");
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await page.waitForURL("**/dashboard", { timeout: 60000 });
  await page.waitForTimeout(1500);

  for (const target of targets) {
    const outputPath = path.resolve(target.output);
    await mkdir(path.dirname(outputPath), { recursive: true });

    await page.goto(`${baseUrl}${target.route}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: target.heading }).first().waitFor({
      timeout: 30000,
    });
    await page.waitForTimeout(1200);

    await page.screenshot({
      path: outputPath,
      fullPage: false,
    });
    console.log(`Saved: ${target.output}`);
  }

  await context.close();
  await browser.close();
}

async function main() {
  let devServer = null;
  try {
    const hasExistingServer = await isServerReachable(BASE_URL);
    if (hasExistingServer) {
      console.log(`Using existing server at ${BASE_URL}`);
    } else if (!USE_EXISTING_SERVER) {
      devServer = startDevServer();
      await waitForServer(BASE_URL);
    } else {
      throw new Error(`No running server found at ${BASE_URL}`);
    }

    await signUpAndCapture(BASE_URL);
    console.log("Feature screenshot capture complete.");
  } finally {
    if (devServer?.pid) {
      stopProcessTree(devServer.pid);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
