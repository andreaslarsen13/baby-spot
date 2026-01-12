#!/usr/bin/env python3
"""
Spot Voice Fine-Tuning Script
Uses Tinker Cookbook for supervised fine-tuning on Spot's editorial minimalism voice.

Usage:
    1. Sign up at https://tinker-console.thinkingmachines.ai
    2. Create an API key and add it to .env file
    3. Run: python scripts/finetune_spot_voice.py
"""

import os
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def main():
    """Run the fine-tuning job using Tinker Cookbook."""

    # Check for API key
    api_key = os.getenv("TINKER_API_KEY")
    if not api_key:
        print("ERROR: TINKER_API_KEY not found in environment.")
        print("Add it to .env file or export TINKER_API_KEY=your_key")
        return

    # Check data file exists
    data_path = Path("CopyWriting_References/spot_voice_training_v4.jsonl")
    if not data_path.exists():
        print(f"ERROR: Training data not found at {data_path}")
        return

    # Count examples
    with open(data_path) as f:
        num_examples = sum(1 for _ in f)
    print(f"Found {num_examples} training examples")

    # Import after env check to avoid slow imports if key missing
    from tinker_cookbook.supervised import train
    from tinker_cookbook.supervised.data import FromConversationFileBuilder
    from tinker_cookbook.supervised.types import ChatDatasetBuilderCommonConfig

    print("\n" + "="*60)
    print("Starting Spot Voice Fine-Tuning")
    print("="*60)
    print(f"Base model: meta-llama/Llama-3.1-8B-Instruct")
    print(f"Training examples: {num_examples}")
    print(f"LoRA rank: 32")
    print("="*60 + "\n")

    # Create dataset builder config
    common_config = ChatDatasetBuilderCommonConfig(
        model_name_for_tokenizer="meta-llama/Llama-3.1-8B-Instruct",
        renderer_name="llama3",
        max_length=2048,
        batch_size=4,
    )

    # Create dataset builder
    dataset_builder = FromConversationFileBuilder(
        common_config=common_config,
        file_path=str(data_path.absolute()),
    )

    # Create training config
    # model_name is the BASE model to fine-tune from
    # Output checkpoints saved to log_path
    config = train.Config(
        log_path="training_logs/spot_voice_v5",
        model_name="meta-llama/Llama-3.1-8B-Instruct",
        dataset_builder=dataset_builder,
        learning_rate=5e-4,  # LoRA requires 10x higher LR than full fine-tuning
        num_epochs=5,
        lora_rank=32,
        save_every=50,
        eval_every=25,
    )

    print("Configuration created. Starting training...")
    print("(This may take a few minutes)\n")

    # Run training
    import asyncio
    asyncio.run(train.main(config))

    print("\n" + "="*60)
    print("Training complete!")
    print(f"Model saved as: spot-voice-v1")
    print("="*60)


if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║         SPOT VOICE FINE-TUNING WITH TINKER                ║
    ╚═══════════════════════════════════════════════════════════╝
    """)

    main()
