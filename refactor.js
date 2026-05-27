const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, 'src', 'main', 'java', 'com', 'Parkify', 'Parkify');
const modelDir = path.join(projectPath, 'model');
const repoDir = path.join(projectPath, 'repository');

// 1. Refactor Models
fs.readdirSync(modelDir).forEach(file => {
    if (file.endsWith('.java')) {
        const filePath = path.join(modelDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove JPA imports
        content = content.replace(/import jakarta\.persistence\.\*;/g, 'import org.springframework.data.annotation.Id;\nimport org.springframework.data.mongodb.core.mapping.Document;\nimport org.springframework.data.mongodb.core.mapping.DBRef;');
        content = content.replace(/import jakarta\.persistence\.[a-zA-Z]+;/g, '');

        // Replace @Entity and @Table with @Document
        content = content.replace(/@Entity/g, '@Document');
        content = content.replace(/@Table\([\s\S]*?\)/g, '');

        // Replace @Id and @GeneratedValue
        content = content.replace(/@GeneratedValue\([\s\S]*?\)/g, '');

        // Remove @Column
        content = content.replace(/@Column\([\s\S]*?\)/g, '');

        // Remove @OneToMany, @ManyToOne, etc.
        content = content.replace(/@(OneToMany|ManyToOne|OneToOne|ManyToMany)\([\s\S]*?\)/g, '@DBRef(lazy = true)');
        content = content.replace(/@JoinColumn\([\s\S]*?\)/g, '');
        
        // Remove @PrePersist (MongoDB doesn't use this directly the same way, but it can use MongoEventListener, we will just keep it or remove it. Let's keep it, but wait, @PrePersist is JPA. We need to replace it or use a Listener)
        // Spring Data Mongo doesn't use @PrePersist. It uses @org.springframework.data.annotation.CreatedDate etc. But we can leave the method and call it from a listener or manually. Let's just remove @PrePersist for now and we will add @CreatedDate where needed.
        content = content.replace(/@PrePersist/g, '');

        fs.writeFileSync(filePath, content, 'utf8');
    }
});

// 2. Refactor Repositories
fs.readdirSync(repoDir).forEach(file => {
    if (file.endsWith('.java')) {
        const filePath = path.join(repoDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace JpaRepository with MongoRepository
        content = content.replace(/import org\.springframework\.data\.jpa\.repository\.JpaRepository;/g, 'import org.springframework.data.mongodb.repository.MongoRepository;');
        content = content.replace(/JpaRepository/g, 'MongoRepository');
        
        // Replace native queries with commented out version so we can fix them manually
        content = content.replace(/@Query\("""([\s\S]*?)"""\)/g, '// @Query("""$1""")');
        content = content.replace(/@Query\("([\s\S]*?)"\)/g, '// @Query("$1")');

        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Refactoring Models and Repositories completed.');
