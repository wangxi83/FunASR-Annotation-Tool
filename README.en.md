# FunASR-Annotation-Tool

Developed a simple annotation tool for FunASR speech engine training materials. Taking Paramformer training as an example:

Core Logic:

1. Create a train_text.txt file
2. Open train_text.txt
3. Record audio and save WAV files locally (one-to-one correspondence with entries in train_text.txt)
4. Generate train_wav.scp file required for Paramformer training

Notes:

1. Currently supports Paramformer requirements only (meets current workflow needs)
2. Future extensions possible (e.g., event/emotion annotations for SenceVoice) - can be implemented via menu switching
Limited stability optimization - users should handle potential issues independently)
<br/>

----

Workflow:

1. Use any LLM to generate train_text.txt. Example prompt:
```
Generate 20 random entries with requirements:
1. These contents can be in Chinese or English
2. Each content should take no more than 30 seconds to read at normal speaking pace. Ensure varied length distribution among generated entries
3. Prefix each content with an ID tag. If using "C" to represent content, the format should be: [ID] [space] [C]. Each entry on a new line
4. IDs must be sequential starting from A0000, incrementing numerically for each entry
5. Strictly follow the "ID space C" format without adding any extra elements
6. Provide only the results without any summaries or explanations
```
2. Save the contens to `{any_working_dir}\train_text.txt`.
3. When running the software, use "Select Material File" or navigate through "File -> Load" to access {working_dir}\train_text.txt
4. Record & save audio
5. Execute "Processing -> Generate JSONL Materials"
   
Results will be generated in `{any_working_dir}\train_text_dist\`


User Interface:

- Basic UI
  
![image](https://github.com/user-attachments/assets/07207ef7-e4a9-4963-9e3c-9308737bbe38)

- Menu

![image](https://github.com/user-attachments/assets/a0e118c8-7b8f-4acf-9b9a-28a148510ed7)

<br/><br/><br/>

Output examples: 

- Result[1]

![image](https://github.com/user-attachments/assets/56db0adf-9c79-4961-ab71-7055598ada64)

- Result[2]

![image](https://github.com/user-attachments/assets/ad3eae6f-0d0a-46b9-8b35-f266873fed84)
