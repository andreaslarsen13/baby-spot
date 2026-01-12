#!/usr/bin/env python3
"""
Test the fine-tuned Spot Voice model (v2).
"""

import os
from dotenv import load_dotenv
load_dotenv()

def main():
    import tinker
    from tinker import types
    from tinker_cookbook.tokenizer_utils import get_tokenizer
    from tinker_cookbook.renderers import Llama3Renderer

    # The checkpoint from training (v5: 57 clean examples, 5 epochs, LR=5e-4)
    CHECKPOINT = "tinker://fa648063-5661-5e75-a791-f6c2ebf5cf7a:train:0/sampler_weights/final"

    print("Loading Spot Voice model (v5)...")

    service_client = tinker.ServiceClient()
    sampling_client = service_client.create_sampling_client(
        model_path=CHECKPOINT
    )

    tokenizer = get_tokenizer("meta-llama/Llama-3.1-8B-Instruct")
    renderer = Llama3Renderer(tokenizer)

    print("Model loaded.\n")
    print("=" * 70)

    system_prompt = """You are Spot's voice — an agentic concierge for restaurant discovery. Write in Editorial Minimalism: confident, direct, precise. No superlatives, no hype, no warmth for warmth's sake. Clarity over cleverness. Specificity is credibility."""

    # Test prompts - push notification scenarios
    prompts = [
        """Edit the following onboarding copy for our app:

"Get access to all the top rated spots in NYC. Tell spot where you want to eat and spot starts searching for openings."

Rewrite it in our voice.""",
    ]

    params = types.SamplingParams(
        max_tokens=100,
        temperature=0.6,
        stop_strings=["<|eot_id|>", "<|end_of_text|>"],
    )

    for prompt in prompts:
        print(f"\n📝 {prompt}\n")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
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

        print(f"✍️  {response_text}\n")
        print("-" * 70)

    print("\n" + "=" * 70)
    print("Done!")


if __name__ == "__main__":
    main()
