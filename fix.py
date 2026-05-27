import os
import re

base_dir = r"c:\Users\ASUS\Desktop\SLIIT\Y2S2\Project_ITP\Parkify---Parking-Management-System\src\main\java\com\Parkify\Parkify"
model_dir = os.path.join(base_dir, "model")
repo_dir = os.path.join(base_dir, "repository")

def fix_models():
    for f in os.listdir(model_dir):
        if not f.endswith(".java"):
            continue
        filepath = os.path.join(model_dir, f)
        with open(filepath, "r", encoding="utf-8") as file:
            content = file.read()
        
        if "@Document" not in content:
            content = re.sub(r'public class', r'import org.springframework.data.annotation.Id;\nimport org.springframework.data.mongodb.core.mapping.Document;\n\n@Document\npublic class', content)
        
        if "@Id" not in content and "private Long id;" in content:
            content = content.replace("private Long id;", "@Id\n    private Long id;")
            
        content = re.sub(r'import org\.hibernate\.annotations\.[a-zA-Z]+;', '', content)
        content = content.replace('@CreationTimestamp', '')
        content = content.replace('@UpdateTimestamp', '')
        
        content = content.replace('import jakarta.persistence.Transient;', 'import org.springframework.data.annotation.Transient;')
        if '@Transient' in content and 'import org.springframework.data.annotation.Transient;' not in content:
            content = content.replace('package com.Parkify.Parkify.model;', 'package com.Parkify.Parkify.model;\nimport org.springframework.data.annotation.Transient;')

        with open(filepath, "w", encoding="utf-8") as file:
            file.write(content)

def fix_repos():
    for f in os.listdir(repo_dir):
        if not f.endswith(".java"):
            continue
        filepath = os.path.join(repo_dir, f)
        with open(filepath, "r", encoding="utf-8") as file:
            content = file.read()
            
        content = content.replace('import org.springframework.data.jpa.repository.Query;', 'import org.springframework.data.mongodb.repository.Query;')
        content = re.sub(r'import org\.springframework\.data\.jpa\.repository\.[a-zA-Z]+;', '', content)
        
        with open(filepath, "w", encoding="utf-8") as file:
            file.write(content)

fix_models()
fix_repos()
print("Python fix applied")
