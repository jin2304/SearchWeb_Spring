package com.web.SearchWeb.config.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * AI 모델 설정
 * - 모든 모델(OpenAI, Gemini, Groq)을 항상 활성화
 * - Service에서 @Qualifier로 필요한 모델을 선택적으로 주입받아 사용
 * - spring.ai.provider는 기본값으로만 사용 (하위호환성)
 *
 * 사용 예시:
 * @Qualifier("openaiChatClient")
 * private ChatClient openaiChatClient;
 *
 * @Qualifier("groqChatClient")
 * private ChatClient groqChatClient;
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class AiConfig {

    private final ObjectMapper mapper;

    
    /**
     * OpenAI ChatClient
     * 활성화: spring.ai.enabled.openai=true (기본값: false)
     */
    @Bean("openaiChatClient")
    @ConditionalOnProperty(name = "spring.ai.enabled.openai", havingValue = "true", matchIfMissing = false)
    public ChatClient openaiChatClient(@Qualifier("openAiChatModel") ChatModel chatModel) {
        return ChatClient.builder(chatModel).build();
    }


    /**
     * Google Gemini ChatClient
     * 활성화: spring.ai.enabled.gemini=true (기본값: true)
     */
    @Bean("geminiChatClient")
    @ConditionalOnProperty(name = "spring.ai.enabled.gemini", havingValue = "true", matchIfMissing = true)
    public ChatClient geminiChatClient(@Qualifier("googleGenAiChatModel") ChatModel chatModel) {
        return ChatClient.builder(chatModel).build();
    }


    /**
     * Groq ChatClient
     * 활성화: spring.ai.enabled.groq=true (기본값: true)
     */
    @Bean("groqChatClient")
    @ConditionalOnProperty(name = "spring.ai.enabled.groq", havingValue = "true", matchIfMissing = true)
    public ChatClient groqChatClient(
            @Value("${spring.ai.groq.api-key}") String apiKey,
            @Value("${spring.ai.groq.chat.options.model}") String model,
            @Value("${spring.ai.groq.chat.options.temperature}") double temperature) {


        // Groq API는 extra_body 프로퍼티를 지원하지 않으므로 요청에서 제거
        RestClient.Builder groqRestClientBuilder = RestClient.builder()
                .requestInterceptor((request, body, execution) -> {
                    try {
                        Map<String, Object> map = mapper.readValue(body, new TypeReference<>() {});
                        if (map != null && map.containsKey("extra_body")) {
                            map.remove("extra_body");
                            body = mapper.writeValueAsBytes(map);
                            request.getHeaders().setContentLength(body.length);
                        }
                    } catch (Exception e) {
                        log.warn("Failed to remove extra_body from Groq request. The request might fail: {}", e.getMessage());
                    }
                    return execution.execute(request, body);
                });

        OpenAiApi groqApi = OpenAiApi.builder()
                .baseUrl("https://api.groq.com/openai")
                .apiKey(apiKey)
                .restClientBuilder(groqRestClientBuilder)
                .build();

        OpenAiChatModel groqModel = OpenAiChatModel.builder()
                .openAiApi(groqApi)
                .defaultOptions(OpenAiChatOptions.builder()
                        .model(model)
                        .temperature(temperature)
                        .build())
                .build();

        return ChatClient.builder(groqModel).build();
    }



    /**
     * 시스템 기본 ChatClient 설정
     * spring.ai.provider 설정에 따라 기본값 결정
     */
    @Bean("chatClient")
    @ConditionalOnProperty(name = "spring.ai.provider", havingValue = "groq", matchIfMissing = true)
    public ChatClient defaultGroqChatClient(@Qualifier("groqChatClient") ChatClient groqChatClient) {
        return groqChatClient;
    }

    @Bean("chatClient")
    @ConditionalOnProperty(name = "spring.ai.provider", havingValue = "openai")
    public ChatClient defaultOpenaiChatClient(@Qualifier("openaiChatClient") ChatClient openaiChatClient) {
        return openaiChatClient;
    }

    @Bean("chatClient")
    @ConditionalOnProperty(name = "spring.ai.provider", havingValue = "gemini")
    public ChatClient defaultGeminiChatClient(@Qualifier("geminiChatClient") ChatClient geminiChatClient) {
        return geminiChatClient;
    }
}
