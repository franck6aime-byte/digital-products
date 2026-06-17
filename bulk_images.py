import urllib.request
import urllib.parse
import os
import time

# Images à générer pour Mai et Juin
ARTICLES_IMAGES = [
    # MAY
    ("youtube_script_ia.png", "hyper-realistic, cinematic, 8k, a glowing futuristic YouTube play button hologram floating above a professional scriptwriter desk, bright studio lighting, gold and crimson red lighting, sleek digital tech concept"),
    ("whatsapp_sales_prompt.png", "hyper-realistic, cinematic, 8k, a glowing smartphone showing a futuristic intelligent chat interface floating in a modern African office, sales concept, sleek digital tech, gold and vivid green lighting"),
    ("instagram_bulk_create.png", "hyper-realistic, cinematic, 8k, a futuristic grid calendar holographic display showing multiple glowing photos, modern minimalist tech desk, gold and vibrant purple lighting, social media automation concept"),
    ("dalle3_vs_midjourney.png", "hyper-realistic, cinematic, 8k, a futuristic split screen comparing two stunning glowing artistic masterpieces forming mid-air, artificial intelligence art battle concept, sleek digital tech, gold violet and neon blue lighting"),
    ("ecommerce_product_description_ia.png", "hyper-realistic, cinematic, 8k, a glowing holographic 3D product box hovering over a dark glass desk, sales graph elements and AI tech UI around it, modern e-commerce concept, gold and cyan lighting"),
    ("coach_onboarding_automation.png", "hyper-realistic, cinematic, 8k, an elegant glowing holographic VIP golden ticket floating above a laptop, premium coaching onboarding concept, sophisticated dark tech environment, rich gold lighting"),
    ("validate_course_idea_ia.png", "hyper-realistic, cinematic, 8k, a glowing holographic mind map and target floating above an entrepreneur's desk, strategy validation concept, sleek modern tech, gold and navy blue lighting"),
    ("voice_cloning_tutorial.png", "hyper-realistic, cinematic, 8k, a glowing futuristic microphone emitting overlapping blue and gold soundwaves, artificial intelligence voice cloning concept, dark studio environment, neon lighting"),
    ("seo_audit_ia.png", "hyper-realistic, cinematic, 8k, a glowing magnifying glass analyzing holographic digital data charts and keywords, artificial intelligence SEO concept, modern tech environment, emerald green and gold lighting"),
    
    # JUNE
    ("chatgpt_google_sheets.png", "hyper-realistic, cinematic, 8k, a glowing complex spreadsheet matrix floating inside a glowing AI brain, data automation nocode concept, sleek digital tech, cyan and gold lighting"),
    ("soap_opera_sequence_ia.png", "hyper-realistic, cinematic, 8k, five glowing holographic email envelopes linked by a glowing thread, marketing sales sequence concept, dark modern environment, amber and purple lighting"),
    ("ai_business_idea.png", "hyper-realistic, cinematic, 8k, a glowing glowing lightbulb forming from holographic tech particles above an African city map, artificial intelligence business idea concept, bright future lighting"),
    ("fatal_prompt_errors.png", "hyper-realistic, cinematic, 8k, a glowing red warning sign intersecting with a floating text prompt line, artificial intelligence error concept, dark dramatic lighting, neon red and gold"),
    ("faceless_tiktok_ia.png", "hyper-realistic, cinematic, 8k, a glowing holographic TikTok logo and a digital AI avatar forming from particles, faceless creator automation concept, modern neon studio, purple and gold lighting"),
    ("entrepreneur_productivity_notion.png", "hyper-realistic, cinematic, 8k, a pristine glowing digital calendar and task list floating above a clean minimalist wooden desk, ultimate productivity concept, warm morning light, cinematic atmosphere"),
    ("difficult_clients_email.png", "hyper-realistic, cinematic, 8k, a glowing shield protecting a professional email interface, diplomacy and customer service concept, sleek digital tech, calm blue and gold lighting"),
    ("q2_automation_report.png", "hyper-realistic, cinematic, 8k, a massive glowing holographic chart showing overwhelming success and growth, artificial intelligence automation victory concept, triumphant cinematic lighting, gold and green")
]

os.makedirs('img', exist_ok=True)

for img_name, prompt in ARTICLES_IMAGES:
    out_path = os.path.join('img', img_name)
    if os.path.exists(out_path):
        print(f"Skipping {img_name}, already exists")
        continue

    print(f"Generating {img_name}...")
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=860&height=400&nologo=true&seed=42"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response, open(out_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"DONE: Downloaded {img_name}")
    except Exception as e:
        print(f"ERROR downloading {img_name}: {e}")
        
    time.sleep(2) # be nice to the API
