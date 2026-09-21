#!/usr/bin/env python3
"""
Launcher script for 'Hawa Mein Likho, AI Pehchane'
PM Shri School - College Tech Orientation Program
"""
import os
import subprocess
import sys
import webbrowser

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    print("=" * 65)
    print("✨ PM SHRI SCHOOL - HAWA MEIN LIKHO, AI PEHCHANE ✨")
    print("   Air Drawing & AI Gesture Recognition System")
    print("=" * 65)
    print("\n🚀 Starting the application server on http://localhost:5173 ...\n")

    try:
        subprocess.run(["npm", "run", "dev", "--", "--host", "--open"], check=True)
    except KeyboardInterrupt:
        print("\n👋 Application stopped cleanly.")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("Please ensure Node.js is installed and run 'npm install && npm run dev'")

if __name__ == "__main__":
    main()
