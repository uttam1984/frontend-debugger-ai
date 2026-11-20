// Keep the server version and flags in the shared root mcp.json.
export function createBobConfig(server, destination, platform = process.platform) {
  const windows = platform === 'win32';
  return { mcpServers: { 'frontend-debugger-browser': {
    // npx is a .cmd shim on Windows and needs a command interpreter.
    // /d disables user cmd AutoRun commands. Paths stay in cwd, not shell text.
    command: windows ? 'cmd.exe' : server.command,
    args: windows ? ['/d', '/c', server.command, ...server.args] : [...server.args],
    cwd: destination,
    env: { ...server.env },
    disabled: false,
    alwaysAllow: [],
  } } };
}
