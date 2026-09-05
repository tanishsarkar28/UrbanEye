"""
UrbanEye - Roboflow Road Defect Cloud Inference Integration
============================================================
Runs inference using Roboflow Serverless Cloud API on model:
    "road-defect-1kdhj/5"

Features:
- Header-based authentication (Authorization: Bearer <API_KEY>)
- Accepts local image file paths, URLs, or base64 image strings
- Formats bounding box predictions with class labels and confidence scores
- Output JSON compatible with UrbanEye detection register & telemetry

Usage:
    python roboflow_defect_inference.py --image path/to/road_photo.jpg --api-key YOUR_API_KEY
    or set environment variable ROBOFLOW_API_KEY
"""

import os
import sys
import json
import argparse
from pathlib import Path

# Load .env if python-dotenv is present
try:
    from dotenv import load_dotenv
    # Search for .env in current directory and parent directory
    load_dotenv()
    backend_env = Path(__file__).resolve().parent.parent / ".env"
    if backend_env.exists():
        load_dotenv(backend_env)
except ImportError:
    pass

try:
    from inference_sdk import InferenceHTTPClient, InferenceConfiguration
except ImportError:
    print("[!] Error: 'inference-sdk' is not installed.")
    print("    Run: pip install inference-sdk")
    sys.exit(1)


MODEL_ID = "road-defect-1kdhj/5"
DEFAULT_API_URL = "https://serverless.roboflow.com"


def run_roboflow_inference(image_input, api_key=None, confidence=0.40):
    """
    Executes inference against Roboflow model 'road-defect-1kdhj/5'
    using secure header-based authentication.
    """
    resolved_api_key = api_key or os.getenv("ROBOFLOW_API_KEY")

    if not resolved_api_key:
        print("[!] ERROR: Roboflow API key is required.")
        print("    Pass via --api-key YOUR_KEY or set ROBOFLOW_API_KEY in your environment / backend .env")
        print("    Get your API key at: https://app.roboflow.com/settings/api")
        return None

    # Initialize client with header-based authorization transport (inference v1.5.0+)
    client = InferenceHTTPClient(
        api_url=DEFAULT_API_URL,
        api_key=resolved_api_key
    ).configure(InferenceConfiguration(
        api_key_transport="header"
    ))

    print(f"[*] Querying Roboflow Serverless Model: {MODEL_ID}")
    print(f"[*] Input: {image_input}")

    try:
        result = client.infer(image_input, model_id=MODEL_ID)
        return result
    except Exception as e:
        print(f"[!] Inference failed: {e}")
        return None


def format_and_print_predictions(result):
    """Formats and prints predictions in clean tabular format."""
    if not result:
        return

    predictions = result.get("predictions", [])
    print("\n" + "=" * 65)
    print(f"ROBOFLOW DETECTION RESULTS (Model: {MODEL_ID})")
    print(f"Total Detections Found: {len(predictions)}")
    print("=" * 65)

    if not predictions:
        print("✓ No road defects detected in this frame (clean road surface or negative sample).")
        return

    print(f"{'Class':<18} | {'Confidence':<12} | {'Center (x, y)':<18} | {'Box Size (w x h)'}")
    print("-" * 65)

    for p in predictions:
        class_name = p.get("class", "unknown")
        conf = p.get("confidence", 0.0)
        x = round(p.get("x", 0), 1)
        y = round(p.get("y", 0), 1)
        w = round(p.get("width", 0), 1)
        h = round(p.get("height", 0), 1)

        print(f"{class_name:<18} | {conf*100:<10.1f}% | ({x}, {y}){' ':<8} | {w} x {h}")

    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Roboflow Road Defect Inference (road-defect-1kdhj/5)")
    parser.add_argument("--image", type=str, required=True, help="Path to road photo or image URL")
    parser.add_argument("--api-key", type=str, default=None, help="Roboflow Private API Key")
    parser.add_argument("--confidence", type=float, default=0.40, help="Confidence threshold (0.0 - 1.0)")
    parser.add_argument("--json", action="store_true", help="Print raw JSON response")

    args = parser.parse_args()

    res = run_roboflow_inference(args.image, api_key=args.api_key, confidence=args.confidence)

    if res:
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            format_and_print_predictions(res)
