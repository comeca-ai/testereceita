#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8082
# Serve files from the repository root by default
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def main():
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        print(f"Servidor HTTP iniciado!")
        print(f"URL: http://localhost:{PORT}/interfaces-viewer.html")
        print(f"Diretório: {DIRECTORY}")
        print("Pressione Ctrl+C para parar o servidor")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor parado.")
            sys.exit(0)

if __name__ == "__main__":
    main()