#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("dns/promises"));
const PF_CONF = "/etc/pf.conf";
const PF_ANCHOR = "/etc/pf.anchors/noyt";
const HOSTS_FILE = "/etc/hosts";
const HOSTS_MARKER = "# noyt-block";
const YOUTUBE_DOMAINS = [
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "youtubei.googleapis.com",
    "yt3.ggpht.com",
    "ytimg.com",
    "i.ytimg.com",
    "s.ytimg.com",
    "googlevideo.com",
    "youtube-nocookie.com",
    "youtube.googleapis.com",
];
// /etc/hosts 
function injectHosts() {
    let content = fs_1.default.readFileSync(HOSTS_FILE, "utf-8");
    if (content.includes(HOSTS_MARKER))
        return;
    const block = `\n${HOSTS_MARKER}\n` +
        YOUTUBE_DOMAINS.map((d) => `127.0.0.1 ${d}\n::1 ${d}`).join("\n") +
        `\n${HOSTS_MARKER}-end\n`;
    fs_1.default.writeFileSync(HOSTS_FILE, content + block);
}
function removeHosts() {
    let content = fs_1.default.readFileSync(HOSTS_FILE, "utf-8");
    const cleaned = content.replace(new RegExp(`\\n${HOSTS_MARKER}[\\s\\S]*?${HOSTS_MARKER}-end\\n`, "g"), "");
    fs_1.default.writeFileSync(HOSTS_FILE, cleaned);
}
function hostsBlocked() {
    const content = fs_1.default.readFileSync(HOSTS_FILE, "utf-8");
    return content.includes(HOSTS_MARKER);
}
//pf anchor
function ensureAnchor() {
    let content = fs_1.default.readFileSync(PF_CONF, "utf-8");
    if (content.includes('load anchor "noyt"'))
        return;
    const block = `\n# noyt anchor\nanchor "noyt/*"\nload anchor "noyt" from "/etc/pf.anchors/noyt"\n`;
    fs_1.default.writeFileSync(PF_CONF, content + block);
}
async function resolveIPs() {
    const v4 = new Set();
    const v6 = new Set();
    for (const domain of YOUTUBE_DOMAINS) {
        try {
            const res = await promises_1.default.resolve4(domain);
            res.forEach((ip) => v4.add(ip));
        }
        catch { }
        try {
            const res = await promises_1.default.resolve6(domain);
            res.forEach((ip) => v6.add(ip));
        }
        catch { }
    }
    return { v4: Array.from(v4), v6: Array.from(v6) };
}
function writePfRules(v4, v6) {
    const rules = [
        ...v4.flatMap((ip) => [
            `block drop out quick proto tcp to ${ip}`,
            `block drop out quick proto udp to ${ip}`,
        ]),
        ...v6.flatMap((ip) => [
            `block drop out quick inet6 proto tcp to ${ip}`,
            `block drop out quick inet6 proto udp to ${ip}`,
        ]),
    ];
    fs_1.default.writeFileSync(PF_ANCHOR, rules.join("\n") + "\n");
}
function clearPfRules() {
    fs_1.default.writeFileSync(PF_ANCHOR, "# noyt — inactive\n");
}
function reloadPf() {
    (0, child_process_1.execSync)("pfctl -f /etc/pf.conf", { stdio: "pipe" });
}
function enablePf() {
    try {
        (0, child_process_1.execSync)("pfctl -e", { stdio: "pipe" });
    }
    catch { }
}
//DNS cache flush
function flushDns() {
    try {
        (0, child_process_1.execSync)("dscacheutil -flushcache", { stdio: "pipe" });
        (0, child_process_1.execSync)("killall -HUP mDNSResponder", { stdio: "pipe" });
    }
    catch { }
}
function notifyRestart() {
    try {
        (0, child_process_1.execSync)(`osascript -e 'display notification "Restart browser. Full blocking may take ~1–3 minutes." with title "noyt 🔒" subtitle "YouTube blocking active"'`, { stdio: "pipe" });
    }
    catch { }
}
async function main() {
    if (process.argv.includes("--version")) {
        console.log("noyt v1.0.1");
        process.exit(0);
    }
    if (process.argv.includes("--help")) {
        console.log(`
noyt — block YouTube system-wide

Usage:
  sudo noyt        Toggle block/unblock

Notes:
  - Requires sudo
  - May take 1–3 minutes to fully take effect
  - Restart your browser after running
`);
        process.exit(0);
    }
    if (process.getuid?.() !== 0) {
        console.error("❌  Run with sudo");
        process.exit(1);
    }
    ensureAnchor();
    if (hostsBlocked()) {
        removeHosts();
        clearPfRules();
        reloadPf();
        flushDns();
        console.log("🔓 YouTube unblocked");
        return;
    }
    console.log("🔍 Resolving YouTube IPs...");
    const { v4, v6 } = await resolveIPs();
    injectHosts();
    writePfRules(v4, v6);
    reloadPf();
    enablePf();
    flushDns();
    notifyRestart();
    console.log(`🔒 YouTube blocked`);
    console.log(`   hosts entries : ${YOUTUBE_DOMAINS.length} domains → 127.0.0.1 and ::1`);
    console.log(`   pf rules      : ${v4.length} IPv4 + ${v6.length} IPv6 IPs (TCP + UDP)`);
    console.log(`   DNS cache     : flushed`);
    console.log(`\n⚠️  Restart your browser — it holds its own DNS cache.`);
    console.log(`⏳  Blocking may take up to 1–3 minutes to fully take effect.`);
}
main();
