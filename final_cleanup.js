const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, 'src', 'main', 'java', 'com', 'Parkify', 'Parkify');
const modelDir = path.join(projectPath, 'model');
const repoDir = path.join(projectPath, 'repository');

// 1. Refactor Models again to fix missing annotations and hibernate annotations
fs.readdirSync(modelDir).forEach(file => {
    if (file.endsWith('.java')) {
        const filePath = path.join(modelDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Add Document and Id if missing (for Otp, FavoriteLocation, ActivityLog etc)
        if (!content.includes('@Document') && content.includes('public class')) {
            content = content.replace(/public class/g, 'import org.springframework.data.annotation.Id;\nimport org.springframework.data.mongodb.core.mapping.Document;\n\n@Document\npublic class');
        }

        // Add @Id to 'private Long id;' if missing
        if (!content.includes('@Id') && content.includes('private Long id;')) {
            content = content.replace(/private Long id;/g, '@Id\n    private Long id;');
        }

        // Replace CreationTimestamp and UpdateTimestamp
        content = content.replace(/import org\.hibernate\.annotations\..*;/g, '');
        content = content.replace(/@CreationTimestamp/g, '/* @CreatedDate */');
        content = content.replace(/@UpdateTimestamp/g, '/* @LastModifiedDate */');

        // Remove @Transient from ParkingPlace (Wait, @Transient is in org.springframework.data.annotation for MongoDB, let's just replace the import)
        content = content.replace(/import jakarta\.persistence\.Transient;/g, 'import org.springframework.data.annotation.Transient;');
        // Or if it's missing, add it
        if (content.includes('@Transient') && !content.includes('import org.springframework.data.annotation.Transient;')) {
            content = content.replace(/package com\.Parkify\.Parkify\.model;/g, 'package com.Parkify.Parkify.model;\nimport org.springframework.data.annotation.Transient;');
        }

        fs.writeFileSync(filePath, content, 'utf8');
    }
});

// 2. Refactor Repositories
fs.readdirSync(repoDir).forEach(file => {
    if (file.endsWith('.java')) {
        const filePath = path.join(repoDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace JPA Query import
        content = content.replace(/import org\.springframework\.data\.jpa\.repository\.Query;/g, 'import org.springframework.data.mongodb.repository.Query;');

        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Final Cleanup completed.');
