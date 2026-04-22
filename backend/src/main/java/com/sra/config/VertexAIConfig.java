package com.sra.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Vertex AI configuration — project, location, and model settings.
 */
@Configuration
public class VertexAIConfig {

    @Value("${vertex-ai.project}")
    private String project;

    @Value("${vertex-ai.location}")
    private String location;

    @Value("${vertex-ai.embedding-model}")
    private String embeddingModel;

    public String getProject() { return project; }
    public String getLocation() { return location; }
    public String getEmbeddingModel() { return embeddingModel; }
}
