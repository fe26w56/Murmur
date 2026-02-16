-- =============================================================================
-- Murmur - Seed Data for context_templates
-- Generated from data/disney-templates.json
-- Contains 26 Disney attraction templates (WDW + DLR)
-- =============================================================================

-- Idempotent: uses ON CONFLICT (id) DO UPDATE to allow re-running safely.

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-mk-haunted-mansion',
  'theme_park'::context_type,
  'WDW - Magic Kingdom',
  'Haunted Mansion',
  '999人の幽霊が住むゴシックな屋敷を巡るダークライド。ゴーストホストのナレーションが全編を通して案内する。',
  '{"summary": "A classic dark ride through a haunted estate narrated by the Ghost Host. Guests travel in Doom Buggies through scenes of ghostly activity including a séance by Madame Leota and a graveyard party.", "script_fragments": ["Welcome, foolish mortals, to the Haunted Mansion. I am your host — your Ghost Host.", "Our tour begins here in this gallery where you see paintings of some of our guests as they appeared in their corruptible, mortal state.", "Is this haunted room actually stretching? Or is it your imagination?", "And consider this dismaying observation: this chamber has no windows and no doors.", "There are several prominent ghosts who have retired here from creepy old crypts all over the world.", "Hurry baaack... hurry baaack... Be sure to bring your death certificate.", "There are 999 happy haunts here, but there''s room for a thousand. Any volunteers?"], "characters": ["Ghost Host", "Madame Leota", "Hitchhiking Ghosts", "Constance Hatchaway", "Singing Busts"], "themes": ["supernatural", "gothic", "humor", "graveyard", "séance"]}'::jsonb,
  '[{"en": "Ghost Host", "ja": "ゴーストホスト", "category": "character"}, {"en": "Haunted Mansion", "ja": "ホーンテッドマンション", "category": "attraction"}, {"en": "Doom Buggy", "ja": "ドゥームバギー", "category": "term"}, {"en": "Madame Leota", "ja": "マダム・レオタ", "category": "character"}, {"en": "Hitchhiking Ghosts", "ja": "ヒッチハイクゴースト", "category": "character"}, {"en": "Constance Hatchaway", "ja": "コンスタンス・ハサウェイ", "category": "character"}, {"en": "foolish mortals", "ja": "愚かなる人間ども", "category": "term"}, {"en": "happy haunts", "ja": "幸せな亡霊たち", "category": "term"}, {"en": "stretching room", "ja": "伸びる部屋", "category": "term"}, {"en": "séance", "ja": "降霊術", "category": "term"}, {"en": "Singing Busts", "ja": "歌う胸像", "category": "term"}, {"en": "death certificate", "ja": "死亡証明書", "category": "term"}, {"en": "corruptible mortal state", "ja": "朽ちゆく生身の姿", "category": "term"}]'::jsonb,
  '{"Haunted Mansion","Ghost Host","foolish mortals","Madame Leota","Doom Buggy","happy haunts","Hitchhiking Ghosts","Constance","séance","stretching room"}',
  1
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-mk-pirates',
  'theme_park'::context_type,
  'WDW - Magic Kingdom',
  'Pirates of the Caribbean',
  '海賊たちの世界を巡るボートライド。骸骨の警告から始まり、海賊の略奪シーンが展開される。',
  '{"summary": "A boat ride through pirate-themed scenes. Features the iconic talking skull warning, pirate attack sequences, and Captain Jack Sparrow appearances throughout.", "script_fragments": ["Ye come seekin'' adventure and salty ol'' pirates, aye? Sure ye come to the proper place.", "Keep a weather eye open, mates, and hold on tight. There be squalls ahead, and Davy Jones waiting for them what don''t obey.", "Dead men tell no tales!", "Avast there! It be too late to alter course, mateys.", "Drink up me hearties, yo ho!", "We wants the redhead! We wants the redhead!"], "characters": ["Talking Skull", "Captain Jack Sparrow", "Captain Barbossa", "Auctioneer", "Pirate Captain"], "themes": ["pirates", "adventure", "treasure", "Caribbean", "naval"]}'::jsonb,
  '[{"en": "Pirates of the Caribbean", "ja": "カリブの海賊", "category": "attraction"}, {"en": "Captain Jack Sparrow", "ja": "キャプテン・ジャック・スパロウ", "category": "character"}, {"en": "Captain Barbossa", "ja": "キャプテン・バルボッサ", "category": "character"}, {"en": "Davy Jones", "ja": "デイヴィ・ジョーンズ", "category": "character"}, {"en": "Dead men tell no tales", "ja": "死人に口なし", "category": "term"}, {"en": "Yo ho", "ja": "ヨーホー", "category": "term"}, {"en": "matey", "ja": "仲間よ", "category": "term"}, {"en": "avast", "ja": "止まれ", "category": "term"}, {"en": "squalls", "ja": "嵐", "category": "term"}, {"en": "plunder", "ja": "略奪", "category": "term"}, {"en": "doubloon", "ja": "ダブロン金貨", "category": "term"}]'::jsonb,
  '{"Pirates of the Caribbean","Jack Sparrow","Barbossa","Davy Jones","dead men tell no tales","yo ho","matey","avast","plunder"}',
  2
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-mk-jungle-cruise',
  'theme_park'::context_type,
  'WDW - Magic Kingdom',
  'Jungle Cruise',
  'スキッパー（船長）のユーモラスなガイドで世界の大河を巡るボートライド。ダジャレ多めのナレーション。',
  '{"summary": "A boat tour through rivers of the world with a comedic skipper narrating pun-filled jokes. Features animatronic animals and the famous ''backside of water'' joke.", "script_fragments": ["My name is your skipper, and I''ll be your [name] for the length of the cruise.", "And now you''ve seen the eighth wonder of the world — the backside of water!", "If you look to the right, you''ll see a group of headhunters. They''re trying to get ahead in life.", "Please watch your children. Anything that falls into the water must stay in the water.", "And on this side, the natives are having a sale. They''ve got everything half off!"], "characters": ["Skipper", "Trader Sam"], "themes": ["jungle", "adventure", "comedy", "puns", "river", "safari"]}'::jsonb,
  '[{"en": "Jungle Cruise", "ja": "ジャングルクルーズ", "category": "attraction"}, {"en": "Skipper", "ja": "スキッパー（船長）", "category": "character"}, {"en": "Trader Sam", "ja": "トレーダー・サム", "category": "character"}, {"en": "backside of water", "ja": "滝の裏側", "category": "term"}, {"en": "headhunters", "ja": "首狩り族", "category": "term"}, {"en": "hippo", "ja": "カバ", "category": "term"}, {"en": "crocodile", "ja": "ワニ", "category": "term"}, {"en": "elephant", "ja": "ゾウ", "category": "term"}]'::jsonb,
  '{"Jungle Cruise","Skipper","Trader Sam","backside of water","headhunters","hippo","crocodile","elephant","safari"}',
  3
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-mk-space-mountain',
  'theme_park'::context_type,
  'WDW - Magic Kingdom',
  'Space Mountain',
  '暗闇の中を疾走する宇宙をテーマにしたインドアローラーコースター。',
  '{"summary": "An indoor roller coaster in near-complete darkness simulating a flight through outer space. Pre-show and queue narration set the space travel theme.", "script_fragments": ["Greetings from Space Mountain. High-speed rockets are now waiting to blast off to all intergalactic destinations.", "Passengers should remain seated with hands and arms inside the vehicle at all times.", "Three... two... one... blast off!"], "characters": [], "themes": ["space", "rockets", "stars", "galaxy", "speed"]}'::jsonb,
  '[{"en": "Space Mountain", "ja": "スペース・マウンテン", "category": "attraction"}, {"en": "blast off", "ja": "発射", "category": "term"}, {"en": "intergalactic", "ja": "銀河間の", "category": "term"}, {"en": "rocket", "ja": "ロケット", "category": "term"}, {"en": "Tomorrowland", "ja": "トゥモローランド", "category": "term"}]'::jsonb,
  '{"Space Mountain","blast off","rocket","Tomorrowland","intergalactic"}',
  4
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-mk-buzz-lightyear',
  'theme_park'::context_type,
  'WDW - Magic Kingdom',
  'Buzz Lightyear''s Space Ranger Spin',
  'バズ・ライトイヤーと共に悪の帝王ザーグを倒すシューティングライド。',
  '{"summary": "An interactive shooting dark ride where guests help Buzz Lightyear defeat Emperor Zurg who is stealing crystallic fusion cells (batteries) to power his weapon.", "script_fragments": ["Greetings, Space Rangers! I''m Buzz Lightyear.", "Emperor Zurg is stealing crystallic fusion cells to power a new weapon of destruction.", "I need your help, Space Rangers! Man your vehicles and we''ll stop Zurg once and for all.", "To infinity... and beyond!", "Great shooting, Rangers! Zurg has been defeated!"], "characters": ["Buzz Lightyear", "Emperor Zurg"], "themes": ["Toy Story", "space", "shooting", "heroes", "villains"]}'::jsonb,
  '[{"en": "Buzz Lightyear", "ja": "バズ・ライトイヤー", "category": "character"}, {"en": "Emperor Zurg", "ja": "悪の帝王ザーグ", "category": "character"}, {"en": "Space Ranger", "ja": "スペースレンジャー", "category": "term"}, {"en": "Star Command", "ja": "スターコマンド", "category": "term"}, {"en": "crystallic fusion cell", "ja": "クリスタリック・フュージョン・セル", "category": "term"}, {"en": "To infinity and beyond", "ja": "無限の彼方へ、さあ行くぞ", "category": "term"}]'::jsonb,
  '{"Buzz Lightyear","Emperor Zurg","Space Ranger","Star Command","infinity and beyond","crystallic fusion"}',
  5
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-ep-spaceship-earth',
  'theme_park'::context_type,
  'WDW - EPCOT',
  'Spaceship Earth',
  '人類のコミュニケーションの歴史を巡るライド。ジュディ・デンチのナレーション。EPCOTのシンボル球体内部。',
  '{"summary": "A slow dark ride inside EPCOT''s iconic geodesic sphere, tracing the history of human communication from cave paintings to the digital age. Narrated by Dame Judi Dench.", "script_fragments": ["Like a grand and miraculous spaceship, our planet has sailed through the universe of time.", "Remember how easy it was to learn your ABC''s? Thank the Phoenicians — they invented them.", "To send a man to the moon, we had to invent a new language, spoken not by man, but by computers.", "What if everyone could have one of these amazing machines in their own house?", "The solution comes in, of all places, a garage in California.", "Here''s to the future. Let''s make it a good one."], "characters": ["Dame Judi Dench (narrator)"], "themes": ["communication", "history", "technology", "civilization", "progress", "future"]}'::jsonb,
  '[{"en": "Spaceship Earth", "ja": "スペースシップ・アース", "category": "attraction"}, {"en": "EPCOT", "ja": "エプコット", "category": "term"}, {"en": "Phoenicians", "ja": "フェニキア人", "category": "term"}, {"en": "geodesic sphere", "ja": "ジオデシック球体", "category": "term"}, {"en": "cave paintings", "ja": "洞窟壁画", "category": "term"}, {"en": "hieroglyphics", "ja": "ヒエログリフ", "category": "term"}, {"en": "Gutenberg", "ja": "グーテンベルク", "category": "term"}, {"en": "Renaissance", "ja": "ルネサンス", "category": "term"}, {"en": "papyrus", "ja": "パピルス", "category": "term"}]'::jsonb,
  '{"Spaceship Earth","EPCOT","Phoenicians","communication","Renaissance","Gutenberg","cave paintings","hieroglyphics","papyrus"}',
  6
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-ep-frozen-ever-after',
  'theme_park'::context_type,
  'WDW - EPCOT',
  'Frozen Ever After',
  '「アナと雪の女王」の世界を巡るボートライド。エルサ、アナ、オラフたちの歌とセリフが楽しめる。',
  '{"summary": "A boat ride through Arendelle celebrating a Summer Snow Day. Features songs from Frozen with Anna, Elsa, Olaf, Kristoff and Sven in animatronic form.", "script_fragments": ["Do you wanna build a snowman? C''mon, I know you do!", "We''re going up to Elsa''s ice palace with you and you and you — all of you!", "It''s time to see what I can do, to test the limits and break through.", "Let it go! Let it go! Can''t hold it back anymore!", "Some people are worth melting for."], "characters": ["Elsa", "Anna", "Olaf", "Kristoff", "Sven", "Grand Pabbie", "Trolls"], "themes": ["Frozen", "ice", "snow", "sisters", "love", "Arendelle", "musical"]}'::jsonb,
  '[{"en": "Frozen Ever After", "ja": "フローズン・エバー・アフター", "category": "attraction"}, {"en": "Elsa", "ja": "エルサ", "category": "character"}, {"en": "Anna", "ja": "アナ", "category": "character"}, {"en": "Olaf", "ja": "オラフ", "category": "character"}, {"en": "Kristoff", "ja": "クリストフ", "category": "character"}, {"en": "Sven", "ja": "スヴェン", "category": "character"}, {"en": "Arendelle", "ja": "アレンデール", "category": "term"}, {"en": "Grand Pabbie", "ja": "グランパビー", "category": "character"}, {"en": "Let it go", "ja": "ありのままで", "category": "term"}, {"en": "Summer Snow Day", "ja": "真夏の雪の日", "category": "term"}, {"en": "ice palace", "ja": "氷の城", "category": "term"}, {"en": "true love", "ja": "真実の愛", "category": "term"}]'::jsonb,
  '{"Frozen","Elsa","Anna","Olaf","Kristoff","Sven","Arendelle","Let it go","ice palace","Grand Pabbie","snowman"}',
  7
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-ep-cosmic-rewind',
  'theme_park'::context_type,
  'WDW - EPCOT',
  'Guardians of the Galaxy: Cosmic Rewind',
  'ガーディアンズ・オブ・ギャラクシーの世界観で展開されるインドアローラーコースター。',
  '{"summary": "An indoor roller coaster featuring the Guardians of the Galaxy. Pre-show with Rocket, Groot and the Xandarian Worldmind, then a reverse-launch coaster experience.", "script_fragments": ["Welcome to the Galaxarium! We''re so excited to share the wonders of the galaxy with you.", "I am Groot!", "We''re the freakin'' Guardians of the Galaxy!", "Today, we''re going to save the galaxy... again."], "characters": ["Star-Lord/Peter Quill", "Gamora", "Rocket", "Groot", "Drax", "Nova Prime"], "themes": ["space", "Marvel", "Guardians", "adventure", "music", "cosmic"]}'::jsonb,
  '[{"en": "Guardians of the Galaxy", "ja": "ガーディアンズ・オブ・ギャラクシー", "category": "term"}, {"en": "Cosmic Rewind", "ja": "コズミック・リワインド", "category": "attraction"}, {"en": "Star-Lord", "ja": "スター・ロード", "category": "character"}, {"en": "Peter Quill", "ja": "ピーター・クイル", "category": "character"}, {"en": "Gamora", "ja": "ガモーラ", "category": "character"}, {"en": "Rocket", "ja": "ロケット", "category": "character"}, {"en": "Groot", "ja": "グルート", "category": "character"}, {"en": "Drax", "ja": "ドラックス", "category": "character"}, {"en": "Nova Prime", "ja": "ノヴァ・プライム", "category": "character"}, {"en": "Xandar", "ja": "ザンダー", "category": "term"}, {"en": "Galaxarium", "ja": "ギャラクサリウム", "category": "term"}]'::jsonb,
  '{"Guardians of the Galaxy","Star-Lord","Rocket","Groot","Gamora","Drax","Xandar","Cosmic Rewind","Galaxarium"}',
  8
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-hs-tower-of-terror',
  'theme_park'::context_type,
  'WDW - Hollywood Studios',
  'The Twilight Zone Tower of Terror',
  '1939年のハリウッドホテルを舞台にしたフリーフォールライド。トワイライトゾーンの世界観。',
  '{"summary": "A drop tower ride themed to The Twilight Zone. Set in the Hollywood Tower Hotel in 1939 where guests enter the Twilight Zone via a haunted service elevator.", "script_fragments": ["You unlock this door with the key of imagination. Beyond it is another dimension.", "A dimension of sound. A dimension of sight. A dimension of mind.", "You''re moving into a land of both shadow and substance, of things and ideas.", "You''ve just crossed over into... the Twilight Zone.", "Hollywood, 1939. Amid the glitz and the glitter of a bustling young movie town at the height of its golden age, the Hollywood Tower Hotel was a star in its own right.", "You are about to discover what lies beyond the fifth dimension.", "The next time you check into a deserted hotel on the dark side of Hollywood, make sure you know just what kind of vacancy you''re filling."], "characters": ["Rod Serling (narrator)", "Bellhop"], "themes": ["Twilight Zone", "horror", "1939", "Hollywood", "elevator", "supernatural"]}'::jsonb,
  '[{"en": "Tower of Terror", "ja": "タワー・オブ・テラー", "category": "attraction"}, {"en": "Twilight Zone", "ja": "トワイライトゾーン", "category": "term"}, {"en": "Hollywood Tower Hotel", "ja": "ハリウッド・タワー・ホテル", "category": "term"}, {"en": "Rod Serling", "ja": "ロッド・サーリング", "category": "character"}, {"en": "the fifth dimension", "ja": "第五の次元", "category": "term"}, {"en": "service elevator", "ja": "業務用エレベーター", "category": "term"}, {"en": "golden age", "ja": "黄金時代", "category": "term"}, {"en": "vacancy", "ja": "空室", "category": "term"}]'::jsonb,
  '{"Tower of Terror","Twilight Zone","Hollywood Tower Hotel","Rod Serling","fifth dimension","Hollywood 1939","elevator"}',
  9
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-hs-rise-of-resistance',
  'theme_park'::context_type,
  'WDW - Hollywood Studios',
  'Star Wars: Rise of the Resistance',
  'レジスタンスとファースト・オーダーの戦いに巻き込まれる大型ライド。レイ、カイロ・レン、フィンが登場。',
  '{"summary": "A massive Star Wars attraction combining multiple ride systems. Guests join the Resistance, are captured by the First Order aboard a Star Destroyer, and must escape with help from Finn and the droids.", "script_fragments": ["The Resistance needs your help. We need every one of you if we''re going to stop the First Order.", "Follow me! We need to get to the transport ships!", "You will tell me everything I want to know.", "Our vehicles have been reprogrammed. They''re going to help us escape!", "All clear! Get to the escape pods!"], "characters": ["Rey", "Kylo Ren", "Finn", "Poe Dameron", "BB-8", "General Hux", "Lieutenant Bek"], "themes": ["Star Wars", "Resistance", "First Order", "space battle", "escape"]}'::jsonb,
  '[{"en": "Rise of the Resistance", "ja": "ライズ・オブ・ザ・レジスタンス", "category": "attraction"}, {"en": "Rey", "ja": "レイ", "category": "character"}, {"en": "Kylo Ren", "ja": "カイロ・レン", "category": "character"}, {"en": "Finn", "ja": "フィン", "category": "character"}, {"en": "Poe Dameron", "ja": "ポー・ダメロン", "category": "character"}, {"en": "BB-8", "ja": "BB-8", "category": "character"}, {"en": "General Hux", "ja": "ハックス将軍", "category": "character"}, {"en": "the Resistance", "ja": "レジスタンス", "category": "term"}, {"en": "First Order", "ja": "ファースト・オーダー", "category": "term"}, {"en": "Star Destroyer", "ja": "スター・デストロイヤー", "category": "term"}, {"en": "Batuu", "ja": "バトゥー", "category": "term"}, {"en": "Galaxy''s Edge", "ja": "ギャラクシーズ・エッジ", "category": "term"}, {"en": "escape pod", "ja": "脱出ポッド", "category": "term"}, {"en": "lightsaber", "ja": "ライトセーバー", "category": "term"}]'::jsonb,
  '{"Rise of the Resistance","Rey","Kylo Ren","Finn","Poe","BB-8","First Order","Resistance","Star Destroyer","Batuu","lightsaber","escape pod"}',
  10
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-hs-rock-n-roller',
  'theme_park'::context_type,
  'WDW - Hollywood Studios',
  'Rock ''n'' Roller Coaster Starring Aerosmith',
  'エアロスミスのコンサートに向かうリムジンで爆走するインドアコースター。0-60mphの急加速。',
  '{"summary": "A high-speed indoor roller coaster featuring Aerosmith music. Pre-show has the band inviting guests to their concert, launching in a stretch limo at high speed.", "script_fragments": ["Hey, we''ve got a little problem here. We''ve got to be across town for a big concert.", "Hey, I got an idea! Why don''t they come with us?", "You guys are going to love this!", "Buckle up and hang on!"], "characters": ["Steven Tyler", "Joe Perry", "Aerosmith members"], "themes": ["rock music", "Aerosmith", "Hollywood", "speed", "concert"]}'::jsonb,
  '[{"en": "Rock ''n'' Roller Coaster", "ja": "ロックンローラー・コースター", "category": "attraction"}, {"en": "Aerosmith", "ja": "エアロスミス", "category": "term"}, {"en": "Steven Tyler", "ja": "スティーヴン・タイラー", "category": "character"}, {"en": "stretch limo", "ja": "ストレッチリムジン", "category": "term"}, {"en": "Hollywood", "ja": "ハリウッド", "category": "term"}]'::jsonb,
  '{"Rock n Roller Coaster","Aerosmith","Steven Tyler","Hollywood","limo","concert"}',
  11
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-ak-kilimanjaro-safaris',
  'theme_park'::context_type,
  'WDW - Animal Kingdom',
  'Kilimanjaro Safaris',
  '本物の動物を間近で見られるサファリライド。ガイドが動物の解説を行う。約18分。',
  '{"summary": "An 18-minute open-air safari ride through a 110-acre wildlife reserve with live animals. A driver/guide narrates and points out animals along the way.", "script_fragments": ["Welcome aboard the Kilimanjaro Safaris! I''m your safari guide.", "Keep your eyes peeled and cameras ready.", "Over on your right, you can see a group of African elephants.", "Those are white rhinos — one of the most endangered species on Earth."], "characters": ["Safari Guide", "Warden Wilson Matua"], "themes": ["safari", "Africa", "wildlife", "conservation", "nature"]}'::jsonb,
  '[{"en": "Kilimanjaro Safaris", "ja": "キリマンジャロ・サファリ", "category": "attraction"}, {"en": "Animal Kingdom", "ja": "アニマルキングダム", "category": "term"}, {"en": "African elephant", "ja": "アフリカゾウ", "category": "term"}, {"en": "white rhino", "ja": "シロサイ", "category": "term"}, {"en": "giraffe", "ja": "キリン", "category": "term"}, {"en": "lion", "ja": "ライオン", "category": "term"}, {"en": "hippopotamus", "ja": "カバ", "category": "term"}, {"en": "cheetah", "ja": "チーター", "category": "term"}, {"en": "zebra", "ja": "シマウマ", "category": "term"}, {"en": "savanna", "ja": "サバンナ", "category": "term"}, {"en": "endangered species", "ja": "絶滅危惧種", "category": "term"}, {"en": "flamingo", "ja": "フラミンゴ", "category": "term"}, {"en": "crocodile", "ja": "ワニ", "category": "term"}, {"en": "gorilla", "ja": "ゴリラ", "category": "term"}, {"en": "okapi", "ja": "オカピ", "category": "term"}]'::jsonb,
  '{"Kilimanjaro","safari","elephant","rhino","giraffe","lion","hippo","cheetah","zebra","savanna","flamingo","gorilla","okapi"}',
  12
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'wdw-ak-flight-of-passage',
  'theme_park'::context_type,
  'WDW - Animal Kingdom',
  'Avatar Flight of Passage',
  '映画「アバター」のバンシーに乗ってパンドラの空を飛ぶ3Dシミュレーションライド。',
  '{"summary": "A 3D flying simulator where guests ride a banshee over the alien world of Pandora. Pre-show explains the Avatar program and the link process.", "script_fragments": ["Welcome to the Avatar program. Today, you''ll be linked to an avatar.", "The banshee is one of the most feared predators on Pandora.", "When a Na''vi bonds with a banshee, it is a bond for life.", "Breathe... relax... and let the link take hold."], "characters": ["Dr. Jackie Ogden", "Mo''at"], "themes": ["Avatar", "Pandora", "flying", "banshee", "Na''vi", "nature", "alien"]}'::jsonb,
  '[{"en": "Flight of Passage", "ja": "フライト・オブ・パッセージ", "category": "attraction"}, {"en": "Avatar", "ja": "アバター", "category": "term"}, {"en": "Pandora", "ja": "パンドラ", "category": "term"}, {"en": "banshee", "ja": "バンシー", "category": "term"}, {"en": "Na''vi", "ja": "ナヴィ", "category": "term"}, {"en": "Pandora - The World of Avatar", "ja": "パンドラ：ザ・ワールド・オブ・アバター", "category": "term"}, {"en": "link", "ja": "リンク（意識接続）", "category": "term"}, {"en": "bioluminescent", "ja": "生物発光の", "category": "term"}]'::jsonb,
  '{"Flight of Passage","Avatar","Pandora","banshee","Na'vi","bioluminescent","link"}',
  13
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dl-haunted-mansion',
  'theme_park'::context_type,
  'DLR - Disneyland',
  'Haunted Mansion',
  '999人の幽霊が住むホーンテッドマンションを、ゴーストホストの案内でドゥームバギーに乗って巡るダークライド。伸びる部屋、舞踏会、墓地シーンなどが有名。',
  '{"summary": "A classic dark ride through a haunted estate narrated by the Ghost Host. Guests enter a stretching room (portrait gallery) that reveals sinister paintings, then board Doom Buggies through a séance room, grand ballroom with waltzing ghosts, graveyard with singing busts, and finally encounter the Hitchhiking Ghosts. The Disneyland version features a unique stretching room that actually descends as an elevator.", "script_fragments": ["Welcome, foolish mortals, to the Haunted Mansion. I am your host — your Ghost Host. Kindly step all the way in please, and make room for everyone. There''s no turning back now.", "Your cadaverous pallor betrays an aura of foreboding, almost as though you sense a disquieting metamorphosis. Is this haunted room actually stretching? Or is it your imagination, hmm? And consider this dismaying observation: this chamber has no windows and no doors — which offers you this chilling challenge: to find a way out!", "We find it delightfully unlivable here in this ghostly retreat. Every room has wall-to-wall creeps and hot and cold running chills.", "Actually, we have 999 happy haunts here — but there''s room for 1,000. Any volunteers?", "Do not pull down on the safety bar, please. I will lower it for you. And heed this warning: the spirits will materialize only if you remain safely seated with your hands, arms, feet, and legs inside.", "Ah, there you are, and just in time! There''s a little matter I forgot to mention. Beware of hitchhiking ghosts! They have selected you to fill our quota, and they''ll haunt you until you return!", "Hurry ba-a-a-ack! Hurry ba-a-a-ack! Be sure to bring your death certificate, if you decide to join us. Make final arrangements now. We''ve been dying to have you..."], "characters": ["Ghost Host", "Madame Leota", "Hitchhiking Ghosts (Ezra, Phineas, Gus)", "Singing Busts", "Constance Hatchaway (Bride)"], "themes": ["haunted house", "ghosts", "stretching room", "doom buggies", "séance", "graveyard", "happy haunts", "hitchhiking ghosts", "grim grinning ghosts"]}'::jsonb,
  '[{"en": "Ghost Host", "ja": "ゴーストホスト", "category": "character"}, {"en": "Haunted Mansion", "ja": "ホーンテッドマンション", "category": "attraction"}, {"en": "Doom Buggy", "ja": "ドゥームバギー", "category": "term"}, {"en": "Madame Leota", "ja": "マダム・レオタ", "category": "character"}, {"en": "Hitchhiking Ghosts", "ja": "ヒッチハイキング・ゴースト", "category": "character"}, {"en": "foolish mortals", "ja": "愚かな人間たち", "category": "term"}, {"en": "happy haunts", "ja": "幸せな亡霊たち", "category": "term"}, {"en": "stretching room", "ja": "伸びる部屋", "category": "term"}, {"en": "séance", "ja": "降霊術", "category": "term"}, {"en": "Constance Hatchaway", "ja": "コンスタンス・ハッチアウェイ", "category": "character"}, {"en": "Grim Grinning Ghosts", "ja": "グリム・グリニング・ゴースト", "category": "term"}, {"en": "cadaverous pallor", "ja": "死人のような青白さ", "category": "term"}, {"en": "disquieting metamorphosis", "ja": "不気味な変容", "category": "term"}]'::jsonb,
  '{"foolish mortals","Ghost Host","Haunted Mansion","stretching room","Doom Buggy","happy haunts","hitchhiking ghosts","Madame Leota","grim grinning ghosts","cadaverous pallor","disquieting metamorphosis","Constance","nine hundred and ninety-nine","séance","materializing"}',
  14
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dl-pirates-caribbean',
  'theme_park'::context_type,
  'DLR - Disneyland',
  'Pirates of the Caribbean',
  'バイユー（湿地帯）から海賊の世界へ。骸骨の警告、海賊の略奪シーン、デイヴィ・ジョーンズの洞窟を巡る水上ダークライド。「Yo Ho, A Pirate''s Life for Me」が響く名作アトラクション。',
  '{"summary": "A boat ride through a Louisiana bayou that descends into a world of swashbuckling pirates. The Disneyland original (1967) features the Blue Bayou restaurant scene, talking skull and crossbones warning, Davy Jones projection, pirate attack on a Caribbean fortress, auction scene, burning town, jail scene with dog holding keys, and the iconic ''Yo Ho'' song throughout. The DLR version has two drops and a longer ride path than WDW.", "script_fragments": ["Psst! Avast there! It be too late to alter course, mateys — and there be plunderin'' pirates lurkin'' in every cove, waitin'' to board. Sit closer together, and keep your ruddy hands inboard — that be the best way to repel boarders. And keep a weather eye open, mates, and hold on tight — with both hands, if you please. There be squalls ahead, and Davy Jones waiting for them what don''t obey.", "Dead men tell no tales!", "Aye, but tales there be aplenty in this cursed place.", "Yo ho, yo ho, a pirate''s life for me! We pillage, we plunder, we rifle and loot. Drink up, me hearties, yo ho! We kidnap and ravage and don''t give a hoot. Drink up, me hearties, yo ho!", "Here be Captain Jack Sparrow! Have ye come to help me, or have ye come to do me harm?"], "characters": ["Talking Skull", "Davy Jones", "Captain Jack Sparrow", "Captain Barbossa", "Auctioneer (Redd)"], "themes": ["pirates", "bayou", "skull and crossbones", "treasure", "Davy Jones", "pirate ship", "Caribbean", "plunder", "yo ho"]}'::jsonb,
  '[{"en": "Pirates of the Caribbean", "ja": "カリブの海賊", "category": "attraction"}, {"en": "Davy Jones", "ja": "デイヴィ・ジョーンズ", "category": "character"}, {"en": "Captain Jack Sparrow", "ja": "ジャック・スパロウ船長", "category": "character"}, {"en": "Captain Barbossa", "ja": "バルボッサ船長", "category": "character"}, {"en": "bayou", "ja": "バイユー（湿地帯）", "category": "term"}, {"en": "dead men tell no tales", "ja": "死人に口なし", "category": "term"}, {"en": "yo ho", "ja": "ヨーホー", "category": "term"}, {"en": "matey", "ja": "仲間（海賊の呼びかけ）", "category": "term"}, {"en": "avast", "ja": "待て（海賊用語）", "category": "term"}, {"en": "plunder", "ja": "略奪", "category": "term"}, {"en": "Talking Skull", "ja": "しゃべるドクロ", "category": "character"}, {"en": "Redd", "ja": "レッド", "category": "character"}, {"en": "Blue Bayou", "ja": "ブルーバイユー", "category": "term"}]'::jsonb,
  '{"dead men tell no tales","Pirates of the Caribbean","yo ho","Davy Jones","Jack Sparrow","Barbossa","avast","matey","plunder","bayou","pillage","hearties","squalls","boarders","doubloons"}',
  15
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dl-indiana-jones',
  'theme_park'::context_type,
  'DLR - Disneyland',
  'Indiana Jones Adventure: Temple of the Forbidden Eye',
  'インディ・ジョーンズの世界でマーラ神の禁断の神殿を探検する。サラーの案内で古代のトループ・トランスポートに乗り、財宝・永遠の若さ・未来予知の3つの運命のひとつに導かれる。マーラの目を見てはいけない！',
  '{"summary": "A motion-simulator enhanced dark ride through the Temple of the Forbidden Eye. Sallah (John Rhys-Davies) guides guests in the queue area. The deity Mara offers three gifts — earthly riches, eternal youth, or visions of the future — but warns visitors never to look into its eyes. Guests inevitably ''look'' and face the Gates of Doom. Indiana Jones (voiced by a soundalike) appears throughout to rescue guests from snakes, lava, a rolling boulder, and other perils. The ride uses an Enhanced Motion Vehicle (EMV) system.", "script_fragments": ["Welcome, my friends, to the Temple of the Forbidden Eye. I, Sallah, shall now give you counsel to seek out a miraculous journey.", "You seek the Treasure of Mara? Glittering gold — it is yours.", "You looked into my eyes! Your path now leads to the Gates of Doom!", "Great... I ask for help and they send me tourists.", "Snakes? You guys are on your own!", "Not bad... for tourists.", "Next time, wear a blindfold, okay?"], "characters": ["Indiana Jones", "Sallah", "Mara (deity)", "Dr. Henry ''Indiana'' Jones Jr."], "themes": ["temple", "forbidden eye", "archaeology", "treasure", "snakes", "boulder", "ancient ruins", "Gates of Doom", "curse"]}'::jsonb,
  '[{"en": "Indiana Jones", "ja": "インディ・ジョーンズ", "category": "character"}, {"en": "Sallah", "ja": "サラー", "category": "character"}, {"en": "Mara", "ja": "マーラ", "category": "character"}, {"en": "Temple of the Forbidden Eye", "ja": "禁断の目の神殿", "category": "attraction"}, {"en": "Gates of Doom", "ja": "破滅の門", "category": "term"}, {"en": "Enhanced Motion Vehicle", "ja": "エンハンスト・モーション・ビークル", "category": "term"}, {"en": "Troop Transport", "ja": "トループ・トランスポート", "category": "term"}, {"en": "treasure", "ja": "財宝", "category": "term"}, {"en": "eternal youth", "ja": "永遠の若さ", "category": "term"}, {"en": "visions of the future", "ja": "未来の予知", "category": "term"}, {"en": "boulder", "ja": "巨大な岩", "category": "term"}, {"en": "Adventureland", "ja": "アドベンチャーランド", "category": "term"}]'::jsonb,
  '{"Indiana Jones","Sallah","Mara","Temple of the Forbidden Eye","Gates of Doom","forbidden eye","tourists","snakes","boulder","treasure","eternal youth","Adventureland","blindfold"}',
  16
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dl-jungle-cruise',
  'theme_park'::context_type,
  'DLR - Disneyland',
  'Jungle Cruise',
  '陽気なスキッパー（船長）がダジャレ満載のジョークで案内する世界の大河をめぐるボートクルーズ。象の水浴び、カバ、「水の裏側」などの名場面がある。',
  '{"summary": "A comedic boat ride through rivers of the world narrated by a wisecracking Skipper. The ride features Audio-Animatronic animals along the Amazon, Congo, Nile, and Mekong rivers. Famous gags include Schweitzer Falls (named after Dr. Albert Falls), the backside of water, trapped safari, dancing natives (updated in 2021), and a grand finale featuring hippos. Each skipper personalizes their script with unique jokes and puns.", "script_fragments": ["Hello, everyone. I''d like to welcome you aboard the world-famous Jungle Cruise. My name is [name] and I''ll be your skipper for as far as we get.", "We''ve now turned down the Nile River, and if you don''t believe that, you must be in de-Nile.", "On your right is beautiful Schweitzer Falls, named after that famous African explorer, Dr. Albert Falls.", "And now, the moment you''ve all been waiting for: the amazing, the colossal, the stupendous eighth wonder of the world — the backside of water!", "Those of you adventurers entering the world-famous Jungle Cruise, please notice there are two lines — one on the right and the other on the left. If you''d like to keep your family together, please stay in the same line. However, if there is someone in your family you''d like to get rid of, just put them in the opposite line and you''ll never see them again."], "characters": ["Skipper (Cast Member)", "Trader Sam", "Dr. Albert Falls"], "themes": ["jungle", "river cruise", "comedy", "puns", "animals", "adventure", "backside of water", "Schweitzer Falls", "hippos"]}'::jsonb,
  '[{"en": "Jungle Cruise", "ja": "ジャングルクルーズ", "category": "attraction"}, {"en": "Skipper", "ja": "スキッパー（船長）", "category": "character"}, {"en": "Trader Sam", "ja": "トレーダー・サム", "category": "character"}, {"en": "Schweitzer Falls", "ja": "シュバイツァー・フォールズ", "category": "term"}, {"en": "backside of water", "ja": "水の裏側", "category": "term"}, {"en": "the Nile", "ja": "ナイル川", "category": "term"}, {"en": "de-Nile (denial)", "ja": "否認（ナイル川のダジャレ）", "category": "term"}, {"en": "hippo", "ja": "カバ", "category": "term"}, {"en": "Adventureland", "ja": "アドベンチャーランド", "category": "term"}, {"en": "Dr. Albert Falls", "ja": "アルバート・フォールズ博士（滝のダジャレ）", "category": "character"}]'::jsonb,
  '{"Jungle Cruise","skipper","backside of water","Schweitzer Falls","Dr. Albert Falls","de-Nile","denial","Trader Sam","hippo","elephant","piranha","safari","Amazon","Congo","Mekong"}',
  17
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dl-rise-of-resistance',
  'theme_park'::context_type,
  'DLR - Disneyland',
  'Star Wars: Rise of the Resistance',
  'レジスタンスの新兵として、レイやフィンと共にファースト・オーダーのスター・デストロイヤーから脱出するマルチモーダル・アトラクション。プレショーからトラックレス・ダークライド、ドロップタワーまで複数のライドシステムを統合。',
  '{"summary": "A multi-phase attraction combining walkthrough experiences, a flight simulator, a trackless dark ride, and a concealed drop tower. Guests are Resistance recruits who receive a mission briefing from Rey (Daisy Ridley) via hologram, board a transport shuttle with Finn and Nien Nunb, get captured by the First Order aboard a Star Destroyer, and must escape past stormtroopers, AT-AT walkers, and Kylo Ren. Located in Star Wars: Galaxy''s Edge (Batuu).", "script_fragments": ["The Resistance needs your help. We need every one of you if we''re going to stop the First Order.", "Poe will be flying escort in his X-wing. He''ll get you through safely.", "All Resistance fighters will be captured and interrogated. No one escapes the First Order.", "I sense something... You have information I need. You will give it to me.", "How brave... but ultimately hopeless."], "characters": ["Rey", "Kylo Ren", "Finn", "Poe Dameron", "General Hux", "BB-8", "Lieutenant Bek", "Nien Nunb"], "themes": ["Star Wars", "Resistance", "First Order", "Star Destroyer", "Galaxy''s Edge", "Batuu", "stormtroopers", "escape", "The Force"]}'::jsonb,
  '[{"en": "Rise of the Resistance", "ja": "ライズ・オブ・ザ・レジスタンス", "category": "attraction"}, {"en": "Rey", "ja": "レイ", "category": "character"}, {"en": "Kylo Ren", "ja": "カイロ・レン", "category": "character"}, {"en": "Finn", "ja": "フィン", "category": "character"}, {"en": "Poe Dameron", "ja": "ポー・ダメロン", "category": "character"}, {"en": "General Hux", "ja": "ハックス将軍", "category": "character"}, {"en": "BB-8", "ja": "BB-8", "category": "character"}, {"en": "First Order", "ja": "ファースト・オーダー", "category": "term"}, {"en": "Resistance", "ja": "レジスタンス", "category": "term"}, {"en": "Star Destroyer", "ja": "スター・デストロイヤー", "category": "term"}, {"en": "Galaxy''s Edge", "ja": "ギャラクシーズ・エッジ", "category": "term"}, {"en": "Batuu", "ja": "バトゥー", "category": "term"}, {"en": "stormtrooper", "ja": "ストームトルーパー", "category": "term"}, {"en": "The Force", "ja": "フォース", "category": "term"}, {"en": "X-wing", "ja": "Xウイング", "category": "term"}, {"en": "AT-AT", "ja": "AT-AT", "category": "term"}, {"en": "lightsaber", "ja": "ライトセーバー", "category": "term"}]'::jsonb,
  '{"Rise of the Resistance","Rey","Kylo Ren","Finn","Poe Dameron","General Hux","BB-8","First Order","Resistance","Star Destroyer","stormtrooper","Galaxy's Edge","Batuu","lightsaber","The Force","AT-AT","X-wing"}',
  18
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dl-matterhorn-bobsleds',
  'theme_park'::context_type,
  'DLR - Disneyland',
  'Matterhorn Bobsleds',
  'マッターホルン山を再現した世界初のチューブラースチール・ローラーコースター。ボブスレーに乗って山の内部を駆け抜け、イエティ（通称ハロルド）に遭遇する。',
  '{"summary": "The world''s first tubular steel roller coaster, built inside a 1/100th scale replica of the Matterhorn mountain. Two separate tracks (Tomorrowland and Fantasyland sides) wind through icy caverns where guests encounter Harold the Abominable Snowman — three Audio-Animatronic yeti figures that roar at riders. The attraction features primarily roars and growls rather than spoken dialogue, plus an iconic safety announcement. Opened in 1959.", "script_fragments": ["For your safety, remain seated with your seat belt fastened, keeping your hands, arms, feet, and legs inside the bobsled. And be sure to watch your children. Auf Wiedersehen!", "Remain seated please. Permanecer sentados por favor.", "[Harold the Abominable Snowman roars menacingly as bobsleds pass through icy caverns]", "Please watch your step and gather your personal belongings as you exit the bobsled.", "[Yodel and Swiss-themed atmospheric music plays throughout the mountain exterior]"], "characters": ["Harold (Abominable Snowman / Yeti)"], "themes": ["mountain", "bobsled", "Matterhorn", "yeti", "abominable snowman", "ice caves", "alpine", "Switzerland"]}'::jsonb,
  '[{"en": "Matterhorn Bobsleds", "ja": "マッターホルン・ボブスレー", "category": "attraction"}, {"en": "Harold", "ja": "ハロルド", "category": "character"}, {"en": "Abominable Snowman", "ja": "イエティ（雪男）", "category": "character"}, {"en": "yeti", "ja": "イエティ", "category": "term"}, {"en": "bobsled", "ja": "ボブスレー", "category": "term"}, {"en": "Auf Wiedersehen", "ja": "アウフ・ヴィーダーゼーエン（さようなら）", "category": "term"}, {"en": "Permanecer sentados por favor", "ja": "座ったままでいてください（スペイン語）", "category": "term"}, {"en": "Fantasyland", "ja": "ファンタジーランド", "category": "term"}, {"en": "Tomorrowland", "ja": "トゥモローランド", "category": "term"}]'::jsonb,
  '{"Matterhorn","bobsled","Harold","Abominable Snowman","yeti","Auf Wiedersehen","remain seated","permanecer sentados","ice caves","Fantasyland","Tomorrowland"}',
  19
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dl-big-thunder-mountain',
  'theme_park'::context_type,
  'DLR - Disneyland',
  'Big Thunder Mountain Railroad',
  'ゴールドラッシュ時代の廃鉱を暴走する鉱山列車型ローラーコースター。「ビッグサンダー・マイニング・カンパニー」の採掘場を駆け抜ける。「荒野で一番ワイルドなライド」。',
  '{"summary": "A mine train roller coaster set during the Gold Rush era at Big Thunder Mining Company. The ride takes guests through desert canyons, mine shafts, and past geological formations while the runaway train races through the abandoned mining town of Rainbow Ridge. Features realistic rock work, Audio-Animatronic animals (goats, possums, coyotes), and dynamic scenes including an earthquake, flash flood, and collapsing mine shaft. Notable for its iconic safety spiel.", "script_fragments": ["Howdy, partners! Hang on to your hats and glasses, ''cause this here''s the wildest ride in the wilderness!", "For your safety, remain seated with your hands, arms, feet, and legs inside the train — and be sure to watch your kids.", "If any of you folks are wearin'' hats or glasses, best remove ''em — ''cause this here''s the wildest ride in the wilderness!", "[Coyote howls echo through the desert canyon as the train approaches the first lift hill]", "Welcome back, partners! Please gather your belongings and exit to your left."], "characters": ["Safety Narrator (Cast Member)"], "themes": ["Gold Rush", "mining", "runaway train", "western", "wilderness", "desert", "canyon", "Frontierland"]}'::jsonb,
  '[{"en": "Big Thunder Mountain Railroad", "ja": "ビッグサンダー・マウンテン", "category": "attraction"}, {"en": "the wildest ride in the wilderness", "ja": "荒野で一番ワイルドなライド", "category": "term"}, {"en": "Gold Rush", "ja": "ゴールドラッシュ", "category": "term"}, {"en": "mining", "ja": "採掘", "category": "term"}, {"en": "runaway train", "ja": "暴走列車", "category": "term"}, {"en": "Rainbow Ridge", "ja": "レインボー・リッジ", "category": "term"}, {"en": "Frontierland", "ja": "フロンティアランド", "category": "term"}, {"en": "Big Thunder Mining Company", "ja": "ビッグサンダー・マイニング・カンパニー", "category": "term"}, {"en": "partners", "ja": "パートナー（西部劇の呼びかけ）", "category": "term"}]'::jsonb,
  '{"Big Thunder Mountain","wildest ride in the wilderness","partners","howdy","Gold Rush","mining","runaway train","Rainbow Ridge","Frontierland","hang on","hats and glasses"}',
  20
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dl-tianas-bayou-adventure',
  'theme_park'::context_type,
  'DLR - Disneyland',
  'Tiana''s Bayou Adventure',
  'ティアナとルイスと一緒にマルディグラのパーティーのためにミュージシャンを探すバイユー（湿地帯）の冒険。ママ・オーディの知恵に導かれ、音楽に満ちた旅を楽しむログライド。',
  '{"summary": "A log flume ride (reimagining of Splash Mountain) following the story of Princess Tiana and her alligator friend Louis as they search for musicians for a special Mardi Gras celebration. Mama Odie guides guests through the bayou where they encounter various animal musicians. Features a 50-foot drop finale, new Audio-Animatronics, and songs from The Princess and the Frog including ''Almost There'' and ''Dig a Little Deeper.'' Opened November 15, 2024 at Disneyland.", "script_fragments": ["If you''re looking for musicians, you don''t have far to go! Tell the people Mama told you so!", "Talent''s everywhere if ya dig down deep enough!", "How low can I go?", "We''re now entering the bayou, home to Tiana''s Bayou Adventure! Take a sneak peek at the big party Princess Tiana''s throwing, where the welcome is warm, the music is hot, and the company is sweet as honey.", "Almost there! I''m almost there! People are gonna come here from everywhere!"], "characters": ["Tiana", "Louis (alligator)", "Mama Odie", "Juju (Mama Odie''s snake)", "Prince Naveen", "Ray (firefly)"], "themes": ["bayou", "Mardi Gras", "music", "New Orleans", "Princess and the Frog", "musicians", "jazz", "beignets", "celebration"]}'::jsonb,
  '[{"en": "Tiana''s Bayou Adventure", "ja": "ティアナのバイユー・アドベンチャー", "category": "attraction"}, {"en": "Tiana", "ja": "ティアナ", "category": "character"}, {"en": "Louis", "ja": "ルイス", "category": "character"}, {"en": "Mama Odie", "ja": "ママ・オーディ", "category": "character"}, {"en": "Juju", "ja": "ジュジュ", "category": "character"}, {"en": "Prince Naveen", "ja": "ナヴィーン王子", "category": "character"}, {"en": "Ray", "ja": "レイ（ホタル）", "category": "character"}, {"en": "Mardi Gras", "ja": "マルディグラ", "category": "term"}, {"en": "bayou", "ja": "バイユー（湿地帯）", "category": "term"}, {"en": "beignet", "ja": "ベニエ（揚げドーナツ）", "category": "term"}, {"en": "jazz", "ja": "ジャズ", "category": "term"}, {"en": "New Orleans", "ja": "ニューオーリンズ", "category": "term"}, {"en": "Almost There", "ja": "もうすぐ（曲名）", "category": "term"}, {"en": "Dig a Little Deeper", "ja": "もっと深く掘り下げて（曲名）", "category": "term"}, {"en": "Critter Country", "ja": "クリッターカントリー", "category": "term"}]'::jsonb,
  '{"Tiana","Bayou Adventure","Louis","Mama Odie","Mardi Gras","beignet","bayou","Almost There","Dig a Little Deeper","musicians","New Orleans","jazz","Prince Naveen","Juju","Critter Country"}',
  21
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dca-guardians-mission-breakout',
  'theme_park'::context_type,
  'DLR - Disney California Adventure',
  'Guardians of the Galaxy - Mission: BREAKOUT!',
  'ロケット・ラクーンと協力してコレクターの要塞から仲間のガーディアンズ・オブ・ギャラクシーを救出する、アクセラレーテッド・ドロップタワー。複数のランダムなドロップ・シーケンスがある。',
  '{"summary": "An accelerated drop tower dark ride (rethemed from Tower of Terror in 2017) in which guests help Rocket Raccoon free the other Guardians of the Galaxy from The Collector''s fortress. Rocket (voiced by Bradley Cooper) hacks into the gantry lift system while guests raise their hands to provide clearance. Features six randomized drop sequences with different songs and scenes. The Collector (Benicio del Toro) appears in the pre-show.", "script_fragments": ["For those of you who have not been paying attention, the name''s Rocket — one of the Guardians of the Galaxy. The smart one.", "Listen up! He''s gonna put you on a gantry-lift for your tour. I''m gonna sneak on top of your lift, and take us all the way to the big ole generator control room. I''m gonna blast that thing, and destroy all the control systems, which will open up every cage in this freak show and free my friends.", "Our buddy Mantis is in the getaway ship, waiting for my signal. And then we''ll be on our merry way!", "BUT... this plan won''t work unless YOU help. I don''t have clearance. My hands don''t scan, yours do. If you raise your hands, I get the clearance and the chaos begins!", "Now show me those hands, people! You''ve got clearance, let''s roll!"], "characters": ["Rocket Raccoon", "The Collector (Taneleer Tivan)", "Star-Lord (Peter Quill)", "Gamora", "Drax the Destroyer", "Groot", "Mantis"], "themes": ["Guardians of the Galaxy", "Marvel", "breakout", "drop tower", "The Collector", "space", "rescue mission", "Avengers Campus"]}'::jsonb,
  '[{"en": "Mission: BREAKOUT!", "ja": "ミッション:ブレイクアウト！", "category": "attraction"}, {"en": "Guardians of the Galaxy", "ja": "ガーディアンズ・オブ・ギャラクシー", "category": "term"}, {"en": "Rocket Raccoon", "ja": "ロケット・ラクーン", "category": "character"}, {"en": "The Collector", "ja": "コレクター", "category": "character"}, {"en": "Star-Lord", "ja": "スター・ロード", "category": "character"}, {"en": "Peter Quill", "ja": "ピーター・クイル", "category": "character"}, {"en": "Gamora", "ja": "ガモーラ", "category": "character"}, {"en": "Drax", "ja": "ドラックス", "category": "character"}, {"en": "Groot", "ja": "グルート", "category": "character"}, {"en": "Mantis", "ja": "マンティス", "category": "character"}, {"en": "gantry lift", "ja": "ガントリー・リフト", "category": "term"}, {"en": "clearance", "ja": "認証（クリアランス）", "category": "term"}, {"en": "Avengers Campus", "ja": "アベンジャーズ・キャンパス", "category": "term"}]'::jsonb,
  '{"Rocket Raccoon","Guardians of the Galaxy","Mission Breakout","Collector","Star-Lord","Gamora","Drax","Groot","Mantis","gantry lift","clearance","generator","Avengers Campus","Peter Quill"}',
  22
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dca-radiator-springs-racers',
  'theme_park'::context_type,
  'DLR - Disney California Adventure',
  'Radiator Springs Racers',
  'カーズの世界「ラジエーター・スプリングス」でメーター、ライトニング・マックィーンたちと出会い、最後にレースを体験するスロットカー式ダークライド。Cars Landの中心的アトラクション。',
  '{"summary": "A slot car dark ride and race through the town of Radiator Springs in Cars Land. Guests encounter Sheriff who warns them to slow down, go tractor tipping with Mater (awakening Frank the combine), then enter town where they pass through either Luigi''s Casa Della Tires or Ramone''s House of Body Art for race preparation. The ride culminates in a high-speed outdoor race against another car, with Lightning McQueen and Sally cheering from the sidelines. Features incredibly detailed rock work recreating the Cadillac Range.", "script_fragments": ["Slow down! You''re not racing yet!", "Just don''t let Frank catch ya!", "Buongiorno! For you, my friends? Only the best!", "Pitstop!", "It takes more than shiny paint to win a race. Now get out there and do us proud!", "Uno for the money; due for the show; tre to get ready; and quattro to... go!"], "characters": ["Lightning McQueen", "Mater (Tow Mater)", "Sally Carrera", "Sheriff", "Luigi", "Guido", "Doc Hudson", "Ramone", "Frank (combine harvester)", "Fillmore", "Sarge", "Red", "Mack"], "themes": ["Cars", "Pixar", "racing", "Radiator Springs", "Cars Land", "Route 66", "tractor tipping", "friendship"]}'::jsonb,
  '[{"en": "Radiator Springs Racers", "ja": "ラジエーター・スプリングス・レーサー", "category": "attraction"}, {"en": "Lightning McQueen", "ja": "ライトニング・マックィーン", "category": "character"}, {"en": "Mater", "ja": "メーター", "category": "character"}, {"en": "Sally Carrera", "ja": "サリー", "category": "character"}, {"en": "Sheriff", "ja": "シェリフ", "category": "character"}, {"en": "Luigi", "ja": "ルイジ", "category": "character"}, {"en": "Guido", "ja": "グイド", "category": "character"}, {"en": "Doc Hudson", "ja": "ドック・ハドソン", "category": "character"}, {"en": "Ramone", "ja": "ラモーン", "category": "character"}, {"en": "Frank", "ja": "フランク（コンバイン）", "category": "character"}, {"en": "Fillmore", "ja": "フィルモア", "category": "character"}, {"en": "Sarge", "ja": "サージ", "category": "character"}, {"en": "Mack", "ja": "マック", "category": "character"}, {"en": "Cars Land", "ja": "カーズランド", "category": "term"}, {"en": "Radiator Springs", "ja": "ラジエーター・スプリングス", "category": "term"}, {"en": "tractor tipping", "ja": "トラクター転がし", "category": "term"}, {"en": "pit stop", "ja": "ピットストップ", "category": "term"}, {"en": "Route 66", "ja": "ルート66", "category": "term"}]'::jsonb,
  '{"Lightning McQueen","Mater","Radiator Springs","Cars Land","Sally","Sheriff","Luigi","Guido","Doc Hudson","Ramone","tractor tipping","Frank","pitstop","Buongiorno","Route 66","Cadillac Range"}',
  23
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dca-incredicoaster',
  'theme_park'::context_type,
  'DLR - Disney California Adventure',
  'Incredicoaster',
  'インクレディブル一家が赤ちゃんのジャック・ジャックを追いかけるストーリーに沿った高速ローラーコースター。エドナ・モードが待機エリアでジャック・ジャックの面倒を見ている。Pixar Pierに位置する。',
  '{"summary": "A launched roller coaster (rethemed from California Screamin'' in 2018) following the Incredibles family chasing baby Jack-Jack after he escapes from Edna Mode''s supervision at a VIP inauguration lounge. The ride features enclosed tunnel scenes with character projections, multiple launches, an inversion, and dialogue from the Incredibles cast. Set after the events of Incredibles 2. Located on Pixar Pier.", "script_fragments": ["Quite normal, darling. Corporations call it synergy.", "Sure, slap our names on an old ride.", "Well, he''ll look fabulous anyway.", "The baby! Jack-Jack is gone!", "Jack-Jack has returned to me. Safe and sound, dahling."], "characters": ["Edna Mode", "Jack-Jack Parr", "Mr. Incredible (Bob Parr)", "Elastigirl (Helen Parr)", "Violet Parr", "Dash Parr"], "themes": ["Incredibles", "Pixar", "superheroes", "roller coaster", "baby chase", "Pixar Pier", "superpowers", "family"]}'::jsonb,
  '[{"en": "Incredicoaster", "ja": "インクレディコースター", "category": "attraction"}, {"en": "Edna Mode", "ja": "エドナ・モード", "category": "character"}, {"en": "Jack-Jack", "ja": "ジャック・ジャック", "category": "character"}, {"en": "Mr. Incredible", "ja": "Mr.インクレディブル", "category": "character"}, {"en": "Elastigirl", "ja": "イラスティガール", "category": "character"}, {"en": "Violet", "ja": "ヴァイオレット", "category": "character"}, {"en": "Dash", "ja": "ダッシュ", "category": "character"}, {"en": "The Incredibles", "ja": "Mr.インクレディブル（インクレディブル・ファミリー）", "category": "term"}, {"en": "Pixar Pier", "ja": "ピクサー・ピア", "category": "term"}, {"en": "No capes!", "ja": "ノーケープ！（マント禁止！）", "category": "term"}, {"en": "dahling", "ja": "ダーリン（エドナの口癖）", "category": "term"}, {"en": "synergy", "ja": "シナジー", "category": "term"}]'::jsonb,
  '{"Incredicoaster","Edna Mode","Jack-Jack","Mr. Incredible","Elastigirl","Violet","Dash","Incredibles","Pixar Pier","no capes","dahling","superpowers","synergy"}',
  24
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dca-monsters-inc',
  'theme_park'::context_type,
  'DLR - Disney California Adventure',
  'Monsters, Inc. Mike & Sulley to the Rescue!',
  '映画『モンスターズ・インク』の世界でマイクとサリーがブーを家に帰す冒険を体験するダークライド。最後にはロズが乗客に話しかけるインタラクティブな仕掛けがある。',
  '{"summary": "A dark ride retelling the story of Monsters, Inc. where Mike Wazowski and James P. ''Sulley'' Sullivan must return Boo to her door while evading Randall and the CDA (Child Detection Agency). The ride features Audio-Animatronics voiced by John Goodman (Sulley), Billy Crystal (Mike), and Steve Buscemi (Randall). The finale features a live-controlled Roz Audio-Animatronic that interacts with specific riders, making personalized comments controlled by a backstage Cast Member.", "script_fragments": ["I''m watching you, Wazowski. Always watching. Always.", "Wazowski! You didn''t file your paperwork last night.", "Now put that thing back where it came from, or so help me...", "Roz, my tender, oozing blossom, you''re looking fabulous today. Is that a new haircut?", "None of this ever happened, gentlemen. And I don''t want to see any paperwork on it."], "characters": ["Mike Wazowski", "James P. ''Sulley'' Sullivan", "Boo", "Roz", "Randall Boggs", "Celia Mae", "Henry J. Waternoose"], "themes": ["Monsters Inc", "Pixar", "Monstropolis", "scream energy", "laugh energy", "doors", "scare floor", "CDA"]}'::jsonb,
  '[{"en": "Monsters, Inc.", "ja": "モンスターズ・インク", "category": "attraction"}, {"en": "Mike Wazowski", "ja": "マイク・ワゾウスキ", "category": "character"}, {"en": "Sulley", "ja": "サリー", "category": "character"}, {"en": "James P. Sullivan", "ja": "ジェームズ・P・サリバン", "category": "character"}, {"en": "Boo", "ja": "ブー", "category": "character"}, {"en": "Roz", "ja": "ロズ", "category": "character"}, {"en": "Randall Boggs", "ja": "ランドール・ボッグス", "category": "character"}, {"en": "Celia", "ja": "セリア", "category": "character"}, {"en": "CDA", "ja": "CDA（子供検出局）", "category": "term"}, {"en": "Monstropolis", "ja": "モンストロポリス", "category": "term"}, {"en": "scare floor", "ja": "スケアフロア（怖がらせフロア）", "category": "term"}, {"en": "always watching", "ja": "いつも見てるわよ", "category": "term"}, {"en": "paperwork", "ja": "書類仕事", "category": "term"}, {"en": "Hollywood Land", "ja": "ハリウッドランド", "category": "term"}]'::jsonb,
  '{"Mike Wazowski","Sulley","Monsters Inc","Boo","Roz","Randall","always watching","Wazowski","paperwork","CDA","Monstropolis","scare floor","put that thing back","Celia"}',
  25
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

INSERT INTO public.context_templates (id, type, park, title, description, researched_data, glossary, keywords, sort_order)
VALUES (
  'dlr-dca-web-slingers',
  'theme_park'::context_type,
  'DLR - Disney California Adventure',
  'WEB SLINGERS: A Spider-Man Adventure',
  'ピーター・パーカーが発明したスパイダーボットが暴走！WEB（ワールドワイド・エンジニアリング・ブリゲード）の技術でウェブを放ってスパイダーボットを捕獲するインタラクティブ・シューティングライド。アベンジャーズ・キャンパスに位置する。',
  '{"summary": "An interactive screen-based dark ride in Avengers Campus where guests use WEB (Worldwide Engineering Brigade) technology to sling virtual webs and capture rogue Spider-Bots. Tom Holland reprises his role as Peter Parker/Spider-Man in the pre-show, demonstrating new inventions before the Spider-Bots malfunction and begin replicating uncontrollably. Guests board WEB Slinger vehicles to help Spider-Man contain the situation across multiple Avengers Campus locations.", "script_fragments": ["Welcome to the Worldwide Engineering Brigade, or as we like to call it — WEB!", "We''ve been developing some really cool new tech. Check out these little guys — Spider-Bots!", "Wait... something''s wrong. They''re replicating! They''re getting out of control!", "I couldn''t have done it without all of you!", "I''ve got to go find Spider-Man! He''ll know what to do!"], "characters": ["Peter Parker / Spider-Man", "Spider-Bots"], "themes": ["Spider-Man", "Marvel", "Avengers Campus", "technology", "robotics", "WEB", "interactive", "shooting ride"]}'::jsonb,
  '[{"en": "WEB SLINGERS", "ja": "ウェブ・スリンガーズ", "category": "attraction"}, {"en": "Spider-Man", "ja": "スパイダーマン", "category": "character"}, {"en": "Peter Parker", "ja": "ピーター・パーカー", "category": "character"}, {"en": "Spider-Bots", "ja": "スパイダーボット", "category": "term"}, {"en": "WEB (Worldwide Engineering Brigade)", "ja": "WEB（ワールドワイド・エンジニアリング・ブリゲード）", "category": "term"}, {"en": "Avengers Campus", "ja": "アベンジャーズ・キャンパス", "category": "term"}, {"en": "web slinging", "ja": "ウェブ・スリンギング（クモの糸を放つ）", "category": "term"}, {"en": "replicating", "ja": "複製（自己増殖）", "category": "term"}]'::jsonb,
  '{"Spider-Man","Peter Parker","WEB SLINGERS","Spider-Bots","Worldwide Engineering Brigade","Avengers Campus","web slinging","replicating","Tom Holland"}',
  26
)
ON CONFLICT (id) DO UPDATE SET
  type            = EXCLUDED.type,
  park            = EXCLUDED.park,
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  researched_data = EXCLUDED.researched_data,
  glossary        = EXCLUDED.glossary,
  keywords        = EXCLUDED.keywords,
  sort_order      = EXCLUDED.sort_order,
  updated_at      = now();

