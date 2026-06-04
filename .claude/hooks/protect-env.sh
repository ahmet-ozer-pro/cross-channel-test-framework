#!/usr/bin/env bash
# PreToolUse hook: .env dosyasının düzenlenmesini engeller (.env.example serbest).
file=$(python3 -c "import sys, json; print(json.load(sys.stdin).get('tool_input', {}).get('file_path', ''))" 2>/dev/null)
case "$file" in
  *.env.example) exit 0 ;;
  *.env|*/.env)
    echo "[hook] .env düzenlenemez — secrets korunuyor. Şablon için .env.example kullan." >&2
    exit 2 ;;
esac
exit 0
