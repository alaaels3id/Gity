# Changelog

All notable changes to the **Gity** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-09-06

### Added
- **Windows Native Compatibility & Environment Auto-Detection**:
  - Automatic Git executable discovery across standard Windows paths (`C:\Program Files\Git\cmd`, `C:\Program Files\Git\bin`, `%LOCALAPPDATA%\Programs\Git\cmd`, and `ProgramW6432`) with OS-specific path delimiter resolution.
  - Windows code editor integration with automatic mapping of `pstorm` to `phpstorm64` on 64-bit Windows environments, with graceful fallback.
  - Dynamic project directory resolution via `getDefaultProjectsPath()`, automatically inspecting user home directories (`~/code`, `~/Projects`, `~/Documents/Projects`, `~/Documents`).
  - Automated migration of legacy hardcoded Unix paths (`/Users/alaaelsaid/code`) to native user directories on Windows.
  - Full Windows NSIS packaging configuration in `electron-builder` (`Gity-Setup-1.2.0.exe`) with custom installation directory support, desktop shortcuts, and start menu shortcuts.
  - Windows native notifications with fallback icon resolution across `process.resourcesPath` and application build assets (`build/icon.png`, `build/icon.ico`).
  - Cross-platform keyboard shortcut indicators in the UI (`Ctrl+R`, `Ctrl+,`, `Ctrl+F` on Windows/Linux vs `⌘` shortcuts on macOS).
  - Added `dist:win` npm script for building Windows installer packages.

### Changed
- **Cross-Platform Hardening & Performance**:
  - Modernized project branding and description to *"Modern Desktop Manager for Laravel Projects and Git Repositories"*.
  - Updated development server launch configuration to use `wait-on tcp:5173` instead of URL hostname polling for improved cross-platform reliability.
  - Sanitized project and root folder identifiers (`safeRootId`) to prevent DOM and React key conflicts caused by Windows drive colons and backslashes (`D:\...`).

### Fixed
- Normalized file path separators (`\` to `/`) when passing paths to `git diff`, `git diff --cached`, and `git checkout / reset` commands on Windows.
- Fixed folder name extraction in `Sidebar` and `ManageFoldersPage` to correctly parse paths containing Windows backslashes (`/[\\/]/`).
- Fixed issue where empty or missing project folder configurations caused scans to silently default to an unreachable macOS path on Windows.

---

## [1.1.0] - 2026-09-05

### Added
- **Advanced Git Repository Operations**:
  - Branch management: view local repository branches, search branches, and switch/checkout branches dynamically.
  - Git pull operations with fast-forward/merge status and upstream synchronization tracking.
  - File diff inspector: deep inspection modal with syntax-highlighted line additions, deletions, and staged/cached diff tracking.
  - Project discard and reset: revert all uncommitted working tree changes or discard changes for individual modified files safely.
- **Multilingual Support (i18n)**:
  - Complete bilingual English and Arabic localization across all UI views, modal dialogs, and navigation components.
  - Right-to-Left (RTL) layout support with dynamic direction flipping and RTL-optimized typography.
- **Project Details View & Badges System**:
  - Dedicated `ProjectDetailsPage` providing deep insight into commit history, modified files, branch status, and remotes.
  - `BadgesPage` component showcasing project framework versions, PHP requirements, and repository health metrics.
- **Enhanced Settings Page**:
  - Full-screen settings page alongside the quick settings modal for configuring scan paths, preferred editor, appearance, and shortcuts.
- **Desktop Notifications**:
  - Integrated native desktop notification dispatch on long-running Git fetch and pull completions.

### Changed
- Redesigned navigation header with search shortcut badges, language switcher, and view mode toggles.
- Refined `ProjectCard` and `ProjectListItem` components with richer status pill badges and quick action toolbars.

---

## [1.0.0] - 2026-09-03

### Added
- **Initial Release of Gity**:
  - Modern desktop manager tailored for Laravel projects and Git repositories built with Electron 41, React 19, TypeScript, and Tailwind CSS v4.
  - Auto-detection of Laravel applications via `artisan` and `composer.json` with framework version and PHP constraint extraction.
  - Real-time Git status inspection: branch name, upstream tracking, ahead/behind commit counts, and untracked/modified file counts.
  - One-click project operations: open in Finder / Explorer, open in code editor (VS Code, PhpStorm, Sublime, Cursor), and remote `git fetch --all --prune`.
  - Bulk "Fetch All" action across all detected projects simultaneously.
  - Multi-folder directory configuration and project folder management.
  - Real-time instant search and status filtering (`All`, `Laravel`, `Modified`, `Behind Remote`, `Clean`).
  - Dark mode glassmorphism UI with responsive layouts and toast notifications.
