import os

try:
    from openai import OpenAI
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    if openai_api_key:
        client = OpenAI(api_key=openai_api_key)
    else:
        client = None
        print("[LLM DEBUG] No OpenAI API key found")
except ImportError as e:
    print(f"[LLM DEBUG] OpenAI import error: {e}")
    client = None
except Exception as e:
    print(f"[LLM DEBUG] OpenAI client initialization error: {e}")
    client = None

def build_prompt(context, question):
    return f"""CONTEXT:
{context}

QUESTION: {question}

Please analyze the context and provide insights about the question. Format your response as a valid JSON object with this exact structure:
{{
  "summary": ["key insight 1", "key insight 2"],
  "facts": ["fact 1 with source citation", "fact 2 with source citation"]
}}

IMPORTANT: When citing sources, use the exact format [Source: doc_id] (not parentheses).

Only use information from the provided context. If the answer is not found in the context, return:
{{
  "summary": ["Insufficient information available"],
  "facts": ["No relevant facts found in the provided context"]
}}"""

def format_context(context_docs):
    return '\n'.join([f"{i+1}. {doc['id']}: {doc['text']}" for i, doc in enumerate(context_docs)])

def get_llm_answer(context_docs, question):
    context = format_context(context_docs)
    prompt = build_prompt(context, question)
    print("[LLM DEBUG] Context Docs:", context_docs)
    print("[LLM DEBUG] Prompt:", prompt)
    if client and openai_api_key:
        try:
            print("[LLM DEBUG] Using OpenAI model: gpt-4o-mini")
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an insights assistant. Always respond with valid JSON in the exact format requested. Do not include any text before or after the JSON object."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.1,
            )
            print("[LLM DEBUG] Raw OpenAI response:", response)
            content = response.choices[0].message.content.strip()
            print("[LLM DEBUG] Raw content:", content)
            
            import json
            try:
                # Try to parse the entire content as JSON first
                answer_json = json.loads(content)
                print("[LLM DEBUG] Parsed LLM answer:", answer_json)
                return answer_json
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from the content
                try:
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = content[json_start:json_end]
                        answer_json = json.loads(json_str)
                        print("[LLM DEBUG] Extracted and parsed JSON:", answer_json)
                        return answer_json
                    else:
                        raise ValueError("No JSON found in response")
                except Exception as parse_exc:
                    print("[LLM DEBUG] JSON parse error:", parse_exc)
                    print("[LLM DEBUG] Content that failed to parse:", content)
                    return {
                        "summary": ["Error parsing LLM response"],
                        "facts": ["The AI response could not be properly formatted"]
                    }
        except Exception as e:
            print("[LLM DEBUG] OpenAI call error:", e)
            return {"summary": [f"Error: {str(e)}"], "facts": ["Insufficient information."]}
    else:
        print("[LLM DEBUG] Using mock answer (no OpenAI or API key)")
        # Check if the query is about Tesla and provide relevant mock data
        if "tesla" in question.lower() or "telsa" in question.lower():
            return {
                "summary": [
                    "Tesla faces supply chain challenges in 2024",
                    "Battery supply shortages are affecting production",
                    "Regulatory issues may impact product launches"
                ],
                "facts": [
                    "Tesla faces battery supply shortages in Q1 2024. [Source: doc_01]",
                    "Cybertruck production delayed due to regulatory issues. [Source: doc_02]"
                ]
            }
        else:
            return {
                "summary": [
                    "Based on the available context, here are the key insights",
                    "Multiple companies are advancing in technology and AI",
                    "Supply chain and regulatory challenges are common themes"
                ],
                "facts": [
                    "Amazon expands drone delivery service in the US. [Source: doc_08]",
                    "Adobe introduces AI tools for creative professionals. [Source: doc_19]",
                    "Zoom adds real-time translation to video calls. [Source: doc_17]"
                ]
            } 