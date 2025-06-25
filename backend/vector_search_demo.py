import numpy as np
import faiss
from typing import List

docs = [
    {
        "id": "doc_01",
        "text": "In Q1 2024, Tesla reported significant battery supply shortages that disrupted production of its Model 3 and Model Y vehicles in both its Fremont and Shanghai factories. The shortages stemmed from increasing global demand for lithium-ion batteries and logistical challenges in securing raw materials. Tesla is exploring partnerships with lithium producers in South America to stabilize its supply chain. Analysts believe the shortages could reduce Tesla's Q2 output by up to 15%.",
    },
    {
        "id": "doc_02",
        "text": "Cybertruck production has been delayed yet again, this time due to regulatory compliance issues in the EU and California. Tesla confirmed that adjustments to the truck's steering and crash detection systems were necessary to meet local safety standards. The vehicle, originally slated for delivery in late 2023, is now expected to enter limited production in Q4 2024. Investors are growing concerned over the repeated delays.",
    },
    {
        "id": "doc_03",
        "text": "SpaceX successfully launched 60 Starlink Gen 2 satellites into low Earth orbit on March 3, 2024, using its Falcon 9 reusable rocket. The launch supports SpaceX's mission to provide high-speed internet access globally, with a focus on underserved rural regions. Elon Musk stated that Starlink has now reached over 2.5 million subscribers across 45 countries. This marks the 28th successful launch for the Starlink program in the past 12 months.",
    },
    {
        "id": "doc_04",
        "text": "On April 10, 2024, OpenAI released GPT-4 Turbo, a new version of its large language model featuring improved reasoning and context handling. The model can now process up to 128k tokens in a single prompt, making it ideal for enterprise applications. Early adopters, including financial and legal firms, have integrated the model into research tools. Privacy advocates remain cautious, urging greater regulation of AI-generated content.",
    },
    {
        "id": "doc_05",
        "text": "Apple introduced its next-generation M4 chip at WWDC 2024, showcasing a 25% performance boost over the M3 in benchmark tests. Designed for use in upcoming MacBook Pro models, the M4 chip includes a new neural engine capable of 40 trillion operations per second. Apple claims this will improve on-device machine learning tasks like image generation and natural language translation significantly.",
    },
    {
        "id": "doc_06",
        "text": "Google announced new AI-powered search features during its I/O 2024 keynote. The company unveiled 'Search Generative Experience' (SGE), which uses generative AI to summarize search results with contextual highlights. The feature, currently in beta, aims to reduce time users spend clicking links by providing instant answers. Publishers have raised concerns about reduced traffic to their websites.",
    },
    {
        "id": "doc_07",
        "text": "Microsoft confirmed a $10 billion acquisition of Luma Games, a cloud-based gaming studio known for real-time multiplayer technologies. The acquisition aligns with Microsoft's strategy to expand its Xbox Cloud Gaming service and compete with platforms like PlayStation Now. Regulatory approval is pending in both the U.S. and UK, with antitrust reviews expected to take several months.",
    },
    {
        "id": "doc_08",
        "text": "Amazon expanded its drone delivery service to three new U.S. cities: Denver, Miami, and Phoenix. The Prime Air drones now deliver lightweight packages in under 30 minutes within a 10-mile radius. Amazon stated that the drone program has achieved over 50,000 deliveries since its 2023 relaunch, with a 98% successful delivery rate. FAA regulations continue to limit expansion in densely populated areas.",
    },
    {
        "id": "doc_09",
        "text": "Meta is facing an antitrust lawsuit filed by the U.S. Federal Trade Commission over its advertising practices on Facebook and Instagram. The suit alleges that Meta used its dominant position to stifle competition in digital advertising by restricting third-party data access. If found guilty, the company could face billions in fines and be required to divest some of its ad tech operations.",
    },
    {
        "id": "doc_10",
        "text": "Nvidia's stock price surged by 14% following its Q1 2024 earnings report, which revealed record-breaking revenue of $26.1 billion, driven largely by demand for its AI-focused GPUs. CEO Jensen Huang announced new partnerships with major cloud providers to deliver high-performance compute for AI training workloads. Analysts see Nvidia as the central player in the current AI hardware boom.",
    },
    {
        "id": "doc_11",
        "text": "Netflix announced a strategic push into interactive content, revealing plans to produce five new choose-your-own-adventure shows by the end of 2024. The company has hired game designers and narrative engineers to work alongside screenwriters. Past experiments like 'Bandersnatch' were well-received, and Netflix believes interactivity will increase viewer retention and reduce subscriber churn.",
    },
    {
        "id": "doc_12",
        "text": "Samsung unveiled its Galaxy Fold 6, featuring a thinner hinge and improved Flex AMOLED display that supports a 120Hz refresh rate. The device is water-resistant and includes a redesigned S-Pen that fits into the frame. Analysts expect foldable phone shipments to exceed 30 million units globally in 2024, with Samsung maintaining a 65% market share.",
    },
    {
        "id": "doc_13",
        "text": "IBM launched its Quantum Cloud Service, allowing researchers and enterprise users to run quantum simulations using the 127-qubit Eagle processor. The platform is accessible via IBM Cloud and integrates with popular data science tools. While quantum computing is still in early stages, IBM reported a 300% increase in developer signups over the past year.",
    },
    {
        "id": "doc_14",
        "text": "Intel delayed its next-gen Arrow Lake processors to mid-2025, citing issues in 3nm fabrication and power efficiency tuning. This delay affects its competitive roadmap against AMD, whose Zen 5 chips are expected in late 2024. Intel reassured stakeholders that Raptor Lake Refresh CPUs will fill the gap in 2024 product lines.",
    },
    {
        "id": "doc_15",
        "text": "X, formerly Twitter, rolled out several new features in Q2 2024 including AI-based content moderation, editable tweets for verified users, and native podcast hosting. CEO Linda Yaccarino emphasized a focus on media monetization and brand safety to attract more advertisers. User feedback has been mixed, with many welcoming the updates but criticizing ongoing content algorithm issues.",
    },
    {
        "id": "doc_16",
        "text": "Sony officially confirmed that it has begun development of the PlayStation 6, with a projected launch date in 2027. Early specs suggest a hybrid cloud-gaming model and support for 8K resolution. In the meantime, Sony plans to release a PlayStation 5 Pro in early 2025, aimed at hardcore gamers and developers.",
    },
    {
        "id": "doc_17",
        "text": "Zoom added real-time language translation to its video conferencing platform, covering 30 languages and dialects. The feature uses AI-powered speech recognition and neural translation. Enterprise customers see this as a game-changer for international collaboration, especially in customer support and remote onboarding scenarios.",
    },
    {
        "id": "doc_18",
        "text": "Oracle has partnered with over 50 startups as part of its Cloud Accelerator Program, offering $1 million in cloud credits and engineering support per company. The goal is to foster AI and analytics development on Oracle Cloud Infrastructure (OCI). Selected startups range from healthcare to fintech, and will participate in a 6-month bootcamp with Oracle mentors.",
    },
    {
        "id": "doc_19",
        "text": "Adobe released a suite of AI tools under the 'Firefly' brand, enabling creatives to generate images, fonts, and color palettes with simple text prompts. Integrated directly into Photoshop and Illustrator, these tools have seen rapid adoption by marketing teams. Adobe emphasized ethical AI, noting that the training data excludes copyrighted work without permission.",
    },
    {
        "id": "doc_20",
        "text": "Uber expanded its electric vehicle (EV) program to over 25 new cities worldwide, aiming to achieve 100% zero-emission rides by 2030. Drivers using EVs will receive bonus incentives and exclusive charging discounts. Uber is partnering with local governments to improve EV infrastructure and reduce barriers to driver adoption.",
    },
]


def get_keyword_mappings():
    return {
        "ai": [
            "ai",
            "artificial intelligence",
            "machine learning",
            "deep learning",
            "neural network",
            "gpt",
            "chatgpt",
            "llm",
            "large language model",
            "generative ai",
            "ai-powered",
            "ai tools",
            "ai chip",
            "ai research",
            "ai model",
            "ai system",
            "ai assistant",
        ],
        "tesla": [
            "tesla",
            "telsa",
            "tesa",
            "tesla motors",
            "autopilot",
            "self-driving",
            "electric car",
        ],
        "cybertruck": ["cybertruck", "cyber truck", "cyber-truck"],
        "spacex": ["spacex", "space x", "space-x", "starlink", "elon musk"],
        "openai": [
            "openai",
            "open ai",
            "open-ai",
            "gpt-4",
            "gpt-4o",
            "gpt-4 turbo",
            "chatgpt",
        ],
        "apple": ["apple", "appl", "macbook", "m4 chip", "iphone", "ipad"],
        "google": ["google", "googl", "ai-powered search", "gemini", "bard"],
        "microsoft": [
            "microsoft",
            "msft",
            "microsoft corp",
            "copilot",
            "azure",
            "bing",
        ],
        "amazon": ["amazon", "amzn", "aws", "drone delivery"],
        "meta": ["meta", "facebook", "fb", "instagram", "whatsapp", "oculus"],
        "nvidia": ["nvidia", "nvda", "ai chip", "gpu", "graphics card", "h100", "a100"],
        "netflix": ["netflix", "nflx", "streaming", "interactive content"],
        "samsung": ["samsung", "foldable phone", "galaxy"],
        "ibm": [
            "ibm",
            "international business machines",
            "quantum computing",
            "watson",
        ],
        "intel": ["intel", "processor", "cpu", "next-gen chip"],
        "twitter": ["twitter", "x", "twtr", "tweet", "rebrand"],
        "sony": ["sony", "playstation", "ps6", "gaming"],
        "zoom": ["zoom", "zoom video", "video calls", "real-time translation"],
        "oracle": ["oracle", "cloud innovation", "startup partner"],
        "adobe": ["adobe", "creative", "ai tools", "photoshop", "illustrator"],
        "uber": ["uber", "ride-sharing", "electric vehicles", "ev"],
    }


def get_mock_embedding(
    text: str, dim: int = 8, is_query: bool = False, original_query: str = ""
) -> List[float]:
    keyword_mappings = get_keyword_mappings()
    vec = np.zeros(dim)
    text_lower = text.lower()
    ai_query = False
    if is_query and any(kw in text_lower for kw in keyword_mappings["ai"]):
        ai_query = True
    if not is_query and original_query:
        oq_lower = original_query.lower()
        ai_query = any(kw in oq_lower for kw in keyword_mappings["ai"])
    for keyword, variations in keyword_mappings.items():
        for variation in variations:
            if variation in text_lower:
                keyword_index = list(keyword_mappings.keys()).index(keyword)
                vec[keyword_index % dim] += 1.0
                break
        if ai_query and keyword in [
            "openai",
            "nvidia",
            "google",
            "microsoft",
            "adobe",
            "ai",
        ]:
            keyword_index = list(keyword_mappings.keys()).index(keyword)
            vec[keyword_index % dim] += 0.8
    vec += np.random.normal(0, 0.01, dim)
    return vec.tolist()


def get_faiss_index():
    doc_embeddings = np.array(
        [get_mock_embedding(doc["text"], dim=8) for doc in docs]
    ).astype("float32")
    index = faiss.IndexFlatL2(8)
    index.add(doc_embeddings)
    return index


def retrieve_top_k_faiss(query_text: str, k=3):
    index = get_faiss_index()
    query_embedding = np.array(
        [get_mock_embedding(query_text, dim=8, is_query=True)]
    ).astype("float32")
    D, I = index.search(query_embedding, k)
    return [docs[i] for i in I[0]]


if __name__ == "__main__":
    query = "Which companies are working on AI chips?"
    top_docs = retrieve_top_k_faiss(query, k=3)
    print("Top 3 relevant documents:")
    for doc in top_docs:
        print(f"- {doc['id']}: {doc['text']}")
