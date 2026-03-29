package com.web.SearchWeb.auth.dao;

import com.web.SearchWeb.auth.domain.RefreshToken;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

/**
 * 리프레시 토큰 데이터 접근 객체(DAO) 인터페이스
 */
@Repository
@RequiredArgsConstructor
public class MybatisRefreshTokenDao implements RefreshTokenDao {

    private final SqlSession sqlSession;
    private static final String NAMESPACE = "com.web.SearchWeb.auth.dao.RefreshTokenDao.";

    /**
     * 새로운 리프레시 토큰 저장
     */
    @Override
    public void insertRefreshToken(RefreshToken refreshToken) {
        
        sqlSession.insert(NAMESPACE + "insertRefreshToken", refreshToken);
    }

    /**
     * 토큰 해시값으로 리프레시 토큰 조회
     */
    @Override
    public RefreshToken findByTokenHash(String tokenHash) {
        return sqlSession.selectOne(NAMESPACE + "findByTokenHash", tokenHash);
    }

    /**
     * 토큰 해시값으로 리프레시 토큰 조회 (비관적 락 적용)
     */
    @Override
    public RefreshToken findByTokenHashForUpdate(String tokenHash) {
        return sqlSession.selectOne(NAMESPACE + "findByTokenHashForUpdate", tokenHash);
    }

    /**
     * 특정 토큰 해시값 삭제
     */
    @Override
    public void deleteByTokenHash(String tokenHash) {
        sqlSession.delete(NAMESPACE + "deleteByTokenHash", tokenHash);
    }

    /**
     * 특정 회원 ID의 모든 토큰 삭제 (로그아웃 등)
     */
    @Override
    public void deleteByMemberId(Long memberId) {
        sqlSession.delete(NAMESPACE + "deleteByMemberId", memberId);
    }

    /**
     * 만료된 토큰 일괄 삭제
     */
    @Override
    public void deleteExpired() {
        sqlSession.delete(NAMESPACE + "deleteExpired");
    }

    /**
     * 토큰 로테이션 시 갱신 시간 업데이트
     */
    @Override
    public void updateRotatedAt(String tokenHash) {
        sqlSession.update(NAMESPACE + "updateRotatedAt", tokenHash);
    }
}
