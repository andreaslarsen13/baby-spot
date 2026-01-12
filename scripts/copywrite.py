#!/usr/bin/env python3
"""
Copywrite: Generate Spot voice copy using the fine-tuned model.
Usage: python scripts/copywrite.py "Your input copy here"
"""

import sys
import os
from dotenv import load_dotenv
load_dotenv()

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/copywrite.py \"Your input copy here\"")
        sys.exit(1)

    input_copy = sys.argv[1]

    import tinker
    from tinker import types
    from tinker_cookbook.tokenizer_utils import get_tokenizer
    from tinker_cookbook.renderers import Llama3Renderer

    # v5 checkpoint: 57 examples, 5 epochs, LR=5e-4
    CHECKPOINT = "tinker://fa648063-5661-5e75-a791-f6c2ebf5cf7a:train:0/sampler_weights/final"

    service_client = tinker.ServiceClient()
    sampling_client = service_client.create_sampling_client(model_path=CHECKPOINT)
    tokenizer = get_tokenizer("meta-llama/Llama-3.1-8B-Instruct")
    renderer = Llama3Renderer(tokenizer)

    # System prompt with Spot context and voice rules
    system_prompt = """You write copy for Spot.

What Spot is:
Spot is an iOS app that books hard-to-get tables in NYC. Tell Spot where you want to eat and when, and Spot handles the rest — whether the restaurant is on Resy, OpenTable, or only takes reservations over the phone. When a table becomes available, Spot immediately books it for you.

Voice rules:
- Use "Spot" as the agent, not "we" or "us"
- No superlatives (never "best", "top", "amazing", "unique")
- Specificity over vagueness — say exactly what happens
- Active voice, confident verbs
- Utility over warmth — helping, not hand-holding
- Short, declarative sentences

Avoid: "curated", "discover", "explore", "unique", "experience", passive voice, meditation-app warmth"""

    # Detect if this is a push notification request
    is_push = "push" in input_copy.lower() or "notification" in input_copy.lower()

    print("=" * 60)
    print("INPUT:")
    print(f'"{input_copy}"')
    print("=" * 60)
    print("\nSPOT VOICE OPTIONS:\n")

    params = types.SamplingParams(
        max_tokens=50,
        temperature=0.7,
        stop_strings=["<|eot_id|>", "<|end_of_text|>", "\n"],
    )

    def generate(prompt_text):
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text},
        ]
        prompt_tokens = renderer.build_generation_prompt(messages)
        future = sampling_client.sample(
            prompt=prompt_tokens,
            num_samples=1,
            sampling_params=params,
        )
        result = future.result()
        response_tokens = result.sequences[0].tokens
        response_text = tokenizer.decode(response_tokens)
        response_text = response_text.replace("<|eot_id|>", "").replace("<|end_of_text|>", "").strip()
        response_text = response_text.strip('"').strip("'")
        return response_text

    # Generate 3 variations
    for i in range(3):
        if is_push:
            # Separate calls for title and body
            title = generate(f"Write a 2-4 word title for: {input_copy}")
            body = generate(f"Write one sentence for: {input_copy}")
            print(f"[{i+1}] Title: {title}")
            print(f"    Body: {body}")
        else:
            # Single call for non-push content
            result = generate(input_copy)
            print(f"[{i+1}] {result}")
        print()

    print("=" * 60)


if __name__ == "__main__":
    main()
