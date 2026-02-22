export const NeonTraceTargets = {
  console: "console",
  terminal: "terminal",
};

export class NeonTrace {
  constructor(options = {}) {
    this.prefix = options.prefix || "";
    this.level = options.level || "debug";
    this.target = options.target || NeonTraceTargets.console;
    this.levels = { debug: 0, info: 1, success: 1, warn: 2, error: 3 };

    // Browser-specific CSS styles
    this.browserStyles = {
      prefix:
        "color: #fff; background: #444; padding: 2px 5px; border-radius: 16px;",
      debug: "color: #6c757d; font-weight: bold;",
      info: "color: #00d4ff; font-weight: bold; text-shadow: 0 0 5px #00d4ff;",
      success:
        "color: #39ff14; font-weight: bold; text-shadow: 0 0 5px #39ff14;",
      warn: "color: #ff9e00; font-weight: bold; text-shadow: 0 0 5px #ff9e00;",
      error: "color: #ff3131; font-weight: bold; text-shadow: 0 0 5px #ff3131;",
      reset: "color: inherit; font-weight: normal;",
    };

    // Node.js ANSI Escape Codes
    this.ansiStyles = {
      prefix: "\x1b[38;5;255m", // Grey bg, White text
      debug: "\x1b[38;5;244m\x1b[1m", // Grey
      info: "\x1b[38;5;45m\x1b[1m", // Cyan
      success: "\x1b[38;5;82m\x1b[1m", // Bright Green
      warn: "\x1b[38;5;214m\x1b[1m", // Orange
      error: "\x1b[38;5;196m\x1b[1m", // Red
      reset: "\x1b[0m", // Reset all
    };
  }

  _shouldLog(type) {
    const currentLevel = this.levels[this.level] ?? 0;
    const targetLevel = this.levels[type] ?? 0;
    return targetLevel >= currentLevel;
  }

  _print(type, msg, args = {}) {
    if (!this._shouldLog(type)) return;

    const _prefix = args.prefix ?? this.prefix;
    const cleanArgs = { ...args };
    delete cleanArgs.prefix;

    if (this.target === NeonTraceTargets.terminal) {
      this._printTerminal(type, _prefix, msg, cleanArgs);
    } else {
      this._printBrowser(type, _prefix, msg, cleanArgs);
    }
  }

  _printBrowser(type, prefix, msg, args) {
    console.log(
      `%c⚡${prefix} %c ${type.toUpperCase()} %c${msg}`,
      this.browserStyles.prefix,
      this.browserStyles[type],
      this.browserStyles.reset,
      Object.keys(args).length > 0 ? args : "",
    );
  }

  _printTerminal(type, msg, args) {
    const s = this.ansiStyles;
    const label = type.toUpperCase();

    // Formatting: [Prefix] LEVEL Message
    const output = `${s.prefix}${s.reset}${s[type]}[${label}]${s.reset} ${msg}`;
    if (Object.keys(args).length > 0) {
      console.log(output, args);
    } else {
      console.log(output);
    }
  }

  debug(m, a) {
    this._print("debug", m, a);
  }
  info(m, a) {
    this._print("info", m, a);
  }
  success(m, a) {
    this._print("success", m, a);
  }
  warn(m, a) {
    this._print("warn", m, a);
  }
  error(m, a) {
    this._print("error", m, a);
  }
}
