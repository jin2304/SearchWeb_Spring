package com.web.SearchWeb.auth.service;

import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.auth.error.AuthException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class ExtensionAuthCodeService {

    private static final Duration CODE_TTL = Duration.ofMinutes(3);
    private static final int CODE_BYTES = 32;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, CodeEntry> codes = new ConcurrentHashMap<>();

    public String issueCode(Long memberId) {
        cleanupExpiredCodes();
        byte[] randomBytes = new byte[CODE_BYTES];
        secureRandom.nextBytes(randomBytes);
        String code = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        codes.put(code, new CodeEntry(memberId, Instant.now().plus(CODE_TTL)));
        return code;
    }

    public Long consumeCode(String code) {
        if (code == null || code.isBlank()) {
            throw AuthException.of(AuthErrorCode.AUTH_INVALID_TOKEN);
        }

        CodeEntry entry = codes.remove(code);
        if (entry == null || entry.expiresAt().isBefore(Instant.now())) {
            throw AuthException.of(AuthErrorCode.AUTH_INVALID_TOKEN);
        }
        return entry.memberId();
    }

    private void cleanupExpiredCodes() {
        Instant now = Instant.now();
        Iterator<Map.Entry<String, CodeEntry>> iterator = codes.entrySet().iterator();
        while (iterator.hasNext()) {
            if (iterator.next().getValue().expiresAt().isBefore(now)) {
                iterator.remove();
            }
        }
    }

    private record CodeEntry(Long memberId, Instant expiresAt) {
    }
}
