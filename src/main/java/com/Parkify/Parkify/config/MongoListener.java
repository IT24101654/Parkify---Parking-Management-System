package com.Parkify.Parkify.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;

@Component
public class MongoListener extends AbstractMongoEventListener<Object> {

    private SequenceGeneratorService sequenceGenerator;

    @Autowired
    public MongoListener(SequenceGeneratorService sequenceGenerator) {
        this.sequenceGenerator = sequenceGenerator;
    }

    @Override
    public void onBeforeConvert(BeforeConvertEvent<Object> event) {
        Object source = event.getSource();
        if (source != null) {
            try {
                Field idField = getField(source.getClass(), "id");
                if (idField != null && idField.getType().equals(Long.class)) {
                    idField.setAccessible(true);
                    Long idValue = (Long) idField.get(source);
                    if (idValue == null || idValue == 0) {
                        idField.set(source, sequenceGenerator.generateSequence(source.getClass().getSimpleName() + "_sequence"));
                    }
                }
            } catch (Exception e) {
                // Handle exception or just ignore if id is not found
            }
        }
    }

    private Field getField(Class<?> clazz, String fieldName) {
        Class<?> tmpClass = clazz;
        do {
            try {
                return tmpClass.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                tmpClass = tmpClass.getSuperclass();
            }
        } while (tmpClass != null);
        return null;
    }
}


