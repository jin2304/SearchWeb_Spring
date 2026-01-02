package com.web.SearchWeb.folder.dao;

import com.web.SearchWeb.folder.domain.Folder;
import com.web.SearchWeb.folder.dto.request.FolderSearchRequestDto;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MybatisFolderDao implements FolderDao {

    private final FolderDao mapper;

    @Autowired
    public MybatisFolderDao(SqlSession sqlSession) {
        mapper = sqlSession.getMapper(FolderDao.class);
    }


    @Override
    public int insertFolder(Folder folder) {
        return mapper.insertFolder(folder);
    }


    @Override
    public Folder selectFolder(int memberId, int folderId) {
        return mapper.selectFolder(memberId, folderId);
    }


    @Override
    public List<Folder> selectFolderList(FolderSearchRequestDto searchRequest) {
        return mapper.selectFolderList(searchRequest);
    }


    @Override
    public int updateFolder(Folder folder) {
        return mapper.updateFolder(folder);
    }


    @Override
    public int deleteFolder(int memberId, int folderId) {
        return mapper.deleteFolder(memberId, folderId);
    }

    
    @Override
    public List<String> selectFolderTags(int memberId) {
        return mapper.selectFolderTags(memberId);
    }
}

