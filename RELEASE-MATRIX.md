# LeadNoria — Authoritative Release Matrix

**Status:** Certified & Frozen  
**Current Baseline:** LeadNoria v1.5.0  

---

## 1. Release History Table

| Version | Release Commit | Git Tag | Artifact Path | Artifact SHA-256 | Manifest SHA-256 | Release Focus | Status |
|---|---|---|---|---|---|---|---|
| **v1.0.0** | `c21d8fa7...` | `v1.0.0` | `dist/leadnoria-v1.0.0.zip` | `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b` | — | Initial Manifest V3 Lead Discovery Pipeline | **IMMUTABLE** |
| **v1.1.0** | `a14ebc91...` | `v1.1.0` | `dist/leadnoria-v1.1.0.zip` | `96f95e56a1b23ff9a686f1f2669ba7bafbcee92012d90d4ac553c77fb41d1b67` | — | Brand identity, iconography, and permission guardrails | **IMMUTABLE** |
| **v1.2.0** | `3b7a8c12...` | — | `dist/leadnoria-v1.2.0.zip` | `3b68968eba2cfd08f0b5ce99f8831c3495158067dd37bce5099ed6f070db0497` | — | Unified lead intelligence & dual UI (Popup + Side Panel) | **IMMUTABLE** |
| **v1.2.1** | `8decd0f9...` | `v1.2.1` | `dist/leadnoria-v1.2.1.zip` | `1c1327049ae85c47e77015e6dadd1bf1c9c31924613807efbfebc942b5ee0419` | `17b567cbc4daf3c77b1a982e7a877d86d8b788855d65feb4d495ac15e042a215` | Defensive people contact evaluation bugfix & package hardening | **IMMUTABLE** |
| **v1.3.0** | `cfcfe5d3...` | `v1.3.0` | `dist/leadnoria-v1.3.0.zip` | `ff05215288e3723367ed8951fc16bb674ec323deaf5a2fb3cfb590a14edb0df2` | `af78fd566c5a2ab3211d96509dcf2e96a69280af7262dd37e769d707287742ef` | Production intelligence analytics engine & interactive Analytics UI | **IMMUTABLE** |
| **v1.4.0** | `9ca5670a804124c6161e1dda3babd446a5fd2043` | `v1.4.0` | `dist/leadnoria-v1.4.0.zip` | `18d0d38a3b70bf9e699d0dc7a64a63ebe2845b39630ce83d4a4637d826d70881` | `ce2dd0e7b10d9e464f0b521e090ea7f4a8299a81aa53a18e591d17272386eba3` | Research optimization & saturation intelligence engine | **IMMUTABLE** |
| **v1.5.0** | `9e248274aff258001c93cfb056d82f22b183fcd6` | `v1.5.0` | `dist/leadnoria-v1.5.0.zip` | `1a55ad80ed3e400b88c7f6d9c36d3dcbccd697737df39cb95c4e0dd4c11c4544` | `b228fa22542404cbe44b1753f1d3371356396eefbc057de41e76bfb7e331faa3` | Production feedback, reliability engine, diagnostics UI & growth readiness | **CERTIFIED BASELINE** |

---

## 2. Release Provenance Verification Procedure

To cryptographically and structurally verify the current certified release (`v1.5.0`):

1. **Verify Git HEAD and Tag Target:**
   ```bash
   git rev-parse HEAD
   # Output must be: 9e248274aff258001c93cfb056d82f22b183fcd6

   git rev-list -n 1 v1.5.0
   # Output must be: 9e248274aff258001c93cfb056d82f22b183fcd6
   ```

2. **Verify Working Tree Hygiene:**
   ```bash
   git status --porcelain
   # Output must be empty (clean working tree)
   ```

3. **Verify Artifact SHA-256 Checksum:**
   ```powershell
   Get-FileHash dist/leadnoria-v1.5.0.zip -Algorithm SHA256
   # Hash must be: 1A55AD80ED3E400B88C7F6D9C36D3DCBCCD697737DF39CB95C4E0DD4C11C4544
   ```

4. **Verify Built Manifest SHA-256 Checksum:**
   ```powershell
   Get-FileHash extension/manifest.json -Algorithm SHA256
   # Hash must be: B228FA22542404CBE44B1753F1D3371356396EEFBC057DE41E76BFB7E331FAA3
   ```

5. **Verify Historical v1.4.0 Baseline Immutability:**
   ```powershell
   Get-FileHash dist/leadnoria-v1.4.0.zip -Algorithm SHA256
   # Hash must be: 18D0D38A3B70BF9E699D0DC7A64A63EBE2845B39630CE83D4A4637D826D70881
   ```

---

## 3. Immutability Policy

* Release archives in `dist/` are immutable binary artifacts.
* Once published, a version's release tag, commit hash, and distribution archive must never be overwritten, force-moved, or re-packaged under the same semantic version.
* Any future modifications require a new semantic version (e.g. `v2.0.0`).
