package com.web.SearchWeb.member.dto.Response;


/**
 * OAuth2Response 인터페이스
 *
 * 코드 작성자:
 *      -서진영(jin2304)
 *
 * 코드 설명:
 *      -여러 소셜 로그인 서비스에서 제공되는 사용자 정보를 통합적으로 처리하기 위한 인터페이스.
 *      -구체적인 소셜 서비스(naver, google, kakao 등)의 사용자 정보 응답 객체가 이 인터페이스를 구현.
 *
 * 주요 메서드:
 *      -getProvider(): 소셜 로그인 제공자의 이름(naver, google, kaKao 등)을 반환.
 *      -getProviderId(): 소셜 로그인 제공자로부터 발급받은 고유 식별자(ID)를 반환.
 *      -getEmail(): 소셜 서비스 사용자 이메일을 반환.
 *      -getName(): 소셜 서비스 사용자 이름을 반환.
 *
 * 인터페이스 사용 목적:
 *      -CustomOAuth2MemberService에서 소셜 서비스 응답 객체를 통합적으로 처리하고,
 *       서비스 로직에서 소셜 서비스 종류와 관계없이 일관된 방식으로 사용자 정보를 활용하기 위함.
 *      -객체지향의 다형성을 활용하여 구현체의 종류와 관계없이 일관된 방식으로 사용자 정보를 처리 가능.
 *      -새로운 소셜 로그인 서비스가 추가되더라도 인터페이스 구현 클래스만 작성하면 확장 가능.
 *
 * 코드 작성일:
 *      -2024.12.26 ~ 2024.12.26
 */
public interface OAuth2Response {

    //제공자 ex) naver, google, kakao ...
    String getProvider();

    //제공자에서 발급해주는 아이디(번호)
    String getProviderId();

    //이메일
    String getEmail();

    //사용자 실명 (설정한 이름)
    String getName();
}