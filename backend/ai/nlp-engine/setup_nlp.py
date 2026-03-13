import subprocess
import sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def setup():
    print("Setting up NLP dependencies...")
    packages = ["textblob", "spacy"]
    for package in packages:
        try:
            install(package)
            print(f"Successfully installed {package}")
        except Exception as e:
            print(f"Failed to install {package}: {str(e)}")
            
    # Download spacy model
    try:
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        print("Successfully downloaded spaCy model en_core_web_sm")
    except Exception as e:
        print(f"Failed to download spaCy model: {str(e)}")

if __name__ == "__main__":
    setup()
