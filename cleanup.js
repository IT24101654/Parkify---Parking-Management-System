const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, 'src', 'main', 'java', 'com', 'Parkify', 'Parkify');
const modelDir = path.join(projectPath, 'model');

fs.readdirSync(modelDir).forEach(file => {
    if (file.endsWith('.java')) {
        const filePath = path.join(modelDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove dangling )
        content = content.replace(/\n\)\npublic class/g, '\npublic class');
        
        // Remove @Enumerated(EnumType.STRING)
        content = content.replace(/@Enumerated\(EnumType\.STRING\)/g, '');
        
        // Remove import jakarta.persistence.Enumerated and EnumType if they somehow exist
        content = content.replace(/import jakarta\.persistence\.Enumerated;/g, '');
        content = content.replace(/import jakarta\.persistence\.EnumType;/g, '');

        fs.writeFileSync(filePath, content, 'utf8');
    }
});
console.log('Cleanup Models completed.');
