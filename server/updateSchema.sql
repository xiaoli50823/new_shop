-- 添加盲盒分类和原价字段
ALTER TABLE blind_boxes ADD COLUMN category VARCHAR(50) COMMENT '分类: anime-动漫, game-游戏, figure-潮玩, movie-影视, designer-设计师, holiday-节日' AFTER description;
ALTER TABLE blind_boxes ADD COLUMN original_price DECIMAL(10,2) COMMENT '原价' AFTER category;
