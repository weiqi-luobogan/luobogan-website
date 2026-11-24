// daily-ritual-lazy.js · 六期拆出：每日棋事簿完整模块（原 site.js 3113-3925）
// 含 QUOTES/DAILY_SIGN/LUCK_SIGNS 内联数据 + 萝卜语录/每日一签/教学理念卡三 tab
// 依赖：window.__luoboLoadScript, TEACHER_CARDS(按需加载)
(function() {
  'use strict';

  // ============ 数据注入点 ============
  var QUOTES = {"gentle": {"label": "温柔治愈", "icon": "🌸", "desc": "累了想被抱抱", "quotes": ["今天下一手也好，不下也没关系，你已经是我心里的定式。", "累了就搁棋盒里歇歇，明天棋盘还是原来那张。", "别急，慢慢来。李昌镐当年也只是先摆一手小飞挂。", "你今天愿意点开我，就是最好的复盘。", "棋盘不会走的，你什么时候回来它都在。", "输一盘不算什么，你还没输过明天。", "一手没下好，抱抱自己，再摸一颗子。", "深呼吸，然后就着这口气下一颗棋，就一颗，不多要。", "手上有点凉？先把棋子握热了再落。", "今天不想复盘也可以，就看看昨天赢下的那颗子。", "你已经很棒了，能坚持到今天点开我。", "不用做完整盘，摆两个死活题也很好。", "我给你打个招呼，你回我一手，就当我们对话过了。", "困的话就睡吧，梦里也可以下棋。", "别跟自己较劲，围棋这一辈子学不完，也不用今天学完。", "你想停就停，想开始就开始，我一直在角落。", "有你在，棋盘就有温度。", "今天下得不好也是今天的样子，我喜欢的。", "把手洗干净，摸一颗子，就是最好的开始。", "累了就跟棋子说话，它会听的。", "不用赢，只要今天你摸过棋子，我就替你高兴。", "你不需要证明什么，你已经在坚持了。", "下不好也别删复盘记录，那是你走过的路。", "今晚就下三手好不好？三手就够。", "允许自己有一手臭棋，允许自己今天不想赢。", "你在棋盘边坐着的样子，最温柔了。", "泡杯茶，等它凉，再落第一颗子。", "记得吃饭。棋可以慢慢下，胃不能。", "今天想被夸就点我，我夸你：你真棒。", "谢谢你，今天也没有把我关起来。"]}, "spicy": {"label": "辛辣嘲讽", "icon": "🌶️", "desc": "犯懒需要人骂", "quotes": ["都三天没碰棋盘了，你手筋是断了吗？", "你的棋盒是不是被封条贴住了？", "上次输棋以后就再没打开过棋谱，是被打怕了吧。", "你这种坚持速度，聂卫平的孙子都能拿冠军了。", "点开我又不下棋，你是在跟我谈恋爱吗？", "你的复盘本比灰姑娘的水晶鞋还干净。", "李昌镐半夜起来摆棋，你半夜起来刷手机。", "别人下棋是打劫，你下棋是打卡，还打得不勤。", "你要再这么下下去，段位表都要把你除名了。", "上一次你完整下完一盘棋是什么朝代的事？", "棋盘想问你：你多久不理我了，心里没数？", "别摆姿势了，摆点子。", "点一次我，下一手不亏，你亏的是良心。", "你说要冲三段，我以为你要认真，结果你连三天都没冲过去。", "你的棋力最近唯一的进步，是理直气壮不下棋。", "藤泽秀行 60 岁还在拼冠军，你 30 岁就想退休？", "别怪自己没时间，你打游戏的时候可从没喊过没时间。", "你这样下棋，对得起你屋里那副贵棋盘吗？", "上次你说要每天做题，题在哭。", "棋书买了一书架，看过的比封面还少。", "别急着骂我毒舌，你摸一手棋我就闭嘴。", "「明天再下」——这话你说了 90 天了。", "你的坚持力，比对方长考的时间还短。", "输了怪 AI 强，赢了夸自己天才，你这心态挺稳。", "别人打卡是打卡，你打卡是打卡机自己在响。", "你今天要是再不摆一题，我就把你收藏的名局给你删了。", "复盘本翻开的次数，比你朋友圈还稀有。", "你以为你在缓一缓，其实你在退一退。", "别怪 AI 让不动你，是你压根没上桌。", "承认吧，你今天不是没时间，你是没脸下。"]}, "backup": {"label": "坚强后盾", "icon": "💪", "desc": "低谷需要托底", "quotes": ["李昌镐输了世界大赛第二天照样复盘。你今天下几手，我陪着。", "输一盘算什么，藤泽秀行输过多少你数得过来吗？他后来赢的更多。", "手抖没关系，落下去就是子。", "别看别人段位，你的对手只有昨天的自己。", "你不是不行，你是还没找到自己的那一手。", "跌到谷底也就多一颗黑子的重量，你扛得住。", "有我在，你今天摆一题，我陪你复一题。", "怕输就先输一盘，输完就不怕了。", "你走过的每一手臭棋，都是你后来那一手妙手的地基。", "别怕慢。徐奉洙 17 岁才入段，40 多岁还能一杆清台。", "你今天下的这一颗子，比昨天所有想法都值钱。", "输了咱不哭，我给你打张分手图，明天再来。", "困难的局面才配得上你，你不是普通选手。", "有人比你聪明，但没人比你更懂你自己的棋风。", "你不是坚持不下来，你只是没找到跟自己和解的方式。", "累的时候看一眼吴清源的棋谱，他 60 岁还在悟大局观。", "别怕臭棋，臭棋才让你记住教训。", "你已经比昨天的你多摆了一颗子，够了。", "被 AI 让 9 子还输？没事，明天让 8 子再来一次。", "你手里的那颗黑子，装着你所有走过来的路。", "刘昌赫经历那么多都没放下棋盘，你的坎跟他比是小坎。", "输给学生也没什么，说明你教得好。", "你不是没天赋，你是没给自己那么多时间。", "回来了就好，棋盘一直在等你。", "怕挨骂就先下给我看，我不骂你。", "你要是塌了，我先把你的棋盘擦干净等你。", "陈祖德带病写完《超越自我》，你今天下三手，也是超越自我。", "别人夸你不用当真，你自己夸自己那才是真的。", "这一手落下去，就没有「如果」了，好过盯着「如果」一辈子。", "你只要还在点开我，我们就没输。"]}, "classic": {"label": "古风诗意", "icon": "🎋", "desc": "想文艺一下", "quotes": ["山僧对棋坐，局上竹阴清——今日一手，何妨？", "偶来松树下，高枕石头眠。棋声一响，梦亦清。", "闲敲棋子落灯花，落一颗，便算你今日的花。", "野桥经雨断，涧水向田分。落子无声，心自安。", "手谈之乐，非在胜负，在于一子一心。", "一子落，风未动；再一子，霜华生。", "松下问童子，言师采药去——你且落一手，我等师归。", "十九路间藏山河，你一手一手，走出一片乾坤。", "对坐清风里，无言胜有言。今日之棋，不必多言。", "君子矜而不争，群而不党——棋盘之上，亦复如是。", "空山不见人，但闻子声响。你落一手，我便应你。", "一枰春色，两袖清风。手谈半晌，胜过烟花万丈。", "秋风落叶时节，摆一局残谱，如故人重逢。", "落子须知白鹤翩翩之意，非为杀，为舞。", "白云回望合，青霭入看无——好棋，也是这般。", "行到水穷处，坐看云起时——棋到胶着时，落子勿急。", "一子无声，天地澄清。今日一手，值得。", "对着棋盘，恍见太古之风。", "落雪时节，一子如梅，一子如霜。", "半窗明月，一枰残棋，人生不过如此。", "对局如对镜，一手照见半生。", "「胜固欣然，败亦可喜」——苏子早已替你说尽。", "闲庭独坐棋盘边，风过处，落一子。", "洞庭西望楚江分，落子一声，江水又深一寸。", "青衫落魄不必愁，一子当空胜万筹。", "手谈无言，谈的是彼此一生的心事。", "今日一手，是给三千年前那位弈者的一句回音。", "一叶落知天下秋，一子落知你今日心境。", "云淡风轻近午天，落一子，便是圆满。", "对坐无言，落子有声——此乃棋之至乐。"]}, "burning": {"label": "热血燃系", "icon": "🔥", "desc": "想被点燃", "quotes": ["藤泽秀行 60 岁还在拼冠军！你这个年纪凭什么不摆棋！", "徐奉洙 44 岁真露杯 9 连胜一杆清台！你今天连一手都不落？", "李昌镐每天研究棋 8 小时，你连 8 分钟都拿不出来？", "陈祖德带着癌症写完《超越自我》。你今天有什么理由不下？", "本因坊丈和血泪拼杀爬到名人棋所！你的棋盘也在等你冲！", "刘昌赫失去妻子后拿出五连冠气魄！你手里那点低谷不算什么！", "赵治勋一年下 100 盘正式赛！你一年下几盘？", "吴清源为一个新手研究 30 年！你连坚持 30 天都做不到？", "聂卫平中日擂台十一连胜！你手里就没这股劲吗？", "马晓春连续 40 个月国内第一！你连续 4 天都撑不住？", "曹薰铉带着李昌镐横扫世界！你带着自己走完今天！", "秀策十九手中国流至今无人破解！你哪来的资格说自己没天赋？", "范西屏施定庵下当湖十局手不发抖！你握颗棋子发什么抖？", "王积薪听老妇下棋一夜通神！你听我一句话，落一手！", "黄龙士 20 出头封棋圣！你 20 出头都没握过棋盒？", "道策发明手割理论重新定义围棋！你也可以重新定义你自己！", "常昊七次世界大赛决赛四次亚军最后拿冠军！你怕过什么！", "古力柯洁哪一个不是拼命练出来的！你手里有的是时间！", "石佛李昌镐一步没错走完官子！你连开局都不敢开？", "藤泽朋斋 90 岁还在摆棋！你 30 岁就摆烂？", "曹薰铉三届富士通冠军！你三天都撑不住？", "过惕生弱冠拜师终成新中国教父！你也是从零开始，为什么不能？", "顾水如民国孤军抗日棋界的骨头！你现在下棋，是幸福的！", "王子晏文人下棋两袖清风一枰春秋！你也可以，落一颗！", "坂田荣男剃刀般精准！你也曾锋利过，别忘了！", "高川格「流水不争先」拿七连霸！你的从容还在！", "武宫正树宇宙流开天辟地！你也有你的宇宙！", "小林光一严谨到令人窒息！你的自律值得再来一次！", "所有大师都是从一手臭棋开始的。你现在，就是他们的起点。", "你不落这一手，你就永远不知道自己能走到哪。落！"]}, "zen": {"label": "佛系躺平", "icon": "🧘", "desc": "想放过自己", "quotes": ["下也好，不下也好，一切随缘…但你已经三天没下了哦。", "赢了是运气好，输了是运气差，人生嘛。", "AI 说你这手不好？AI 又不用交房租，随它说去。", "段位不重要，重要的是今天有没有笑过。", "错手也是手，反正棋盘不会告你。", "你不下，棋盘也不会怪你，我可能会哦。", "复盘就复盘吧，不复盘就不复盘吧，天亮了再说。", "输了？没事，反正世界不会因此改变半分。", "「胜固欣然，败亦可喜」——你看古人多想得开。", "今天没时间就明天，明天没时间就下周，慢慢来。", "棋盘上放两颗子摆个心形也可以，谁规定必须要下正经棋？", "累了就走，累了就停，累了就当自己是一颗被拈起来又放回去的棋子。", "「空亦是色，色亦是空」——一颗子的得失，何足挂齿。", "别想了，先睡觉，睡醒棋子还是黑白两色。", "赢的时候不飞，输的时候不哭，佛系棋手就是这样。", "水到渠成，棋到手熟。别硬掰。", "今天下不下都行，我就是想你了。", "下棋是修行，不下棋也是修行。", "对手强？强就强呗，你有你的活法。", "少一手棋，多一次呼吸，也是收获。", "别人 30 岁得世界冠军，你 30 岁得心平气和，一样值钱。", "AI 让你 9 子？让就让呗，反正它也不发工资。", "有些棋走不好，是因为还没到时候。", "今日棋不悟，明日再悟。棋不生锈，你也是。", "「落子无悔」是对高手说的，你落错了改改也没关系。", "「不争，天下莫能与之争」——不下棋的人反而下得最好？", "今天你不点我我不怪你，你点我我陪你聊两句。", "输给学生了？说明你会教书了，恭喜。", "「棋道一百，我只知七」——你今天连一都不用知。", "算了，别摆了，就当你已经赢了。（其实我盼你摆一颗。）"]}, "joke": {"label": "段子搞笑", "icon": "😂", "desc": "想乐一乐", "quotes": ["医生说我血压高，我说我一天不下棋才血压高。", "「落子无悔」是骗小孩的，我每次落完都想悔到唐朝。", "你的棋盘再不用，就要长蘑菇了。（真的。）", "AI 让我 9 子，我谢它 9 遍。", "问我为什么下棋？因为麻将三缺一。", "你的棋，臭得像我上周忘在冰箱里的鱼。", "「金角银边草肚皮」——我下的每一手都在肚皮。", "别人复盘是学，我复盘是回顾人生失败史。", "我下棋不看段位看运气，运气不好我就说昨晚没睡好。", "上次赢学生一盘，学生 3 岁。这算成就吗算吗？", "打劫？我劫我自己的时间下不下棋，天天打。", "「棋盘如战场」——那我就是那个总迷路的士兵。", "别问我为啥输，问就是天时地利人和都不在我这。", "棋圣是别人的，我是棋剩，剩下来的剩。", "「一子定乾坤」——我一子定坟头。", "输了别难过，赢的人可能是作弊。（别真信，转发这段可赢十年好棋。）", "我以为我在下围棋，AI 以为我在给它送分。", "医生：你需要放松。我：好的，我去下棋。医生：换一个。", "「胜负乃兵家常事」——但主要是我在负。", "别人下棋越下越聪明，我下棋越下越沉默。", "AI 说这手是妙手，我以为夸我，其实夸的是它自己。", "「落子无声」是骗人的，我每次都「啪」一声，主要是气。", "我棋盘上放了张辣椒图片，希望能辣一辣我的棋力。", "「一将功成万骨枯」——我这盘棋，是万骨我全占了。", "下棋前抽卡：抽到大师就赢，抽到菜鸡就是我今天。", "有人吸猫，有人吸猫粮，我吸棋谱。", "「棋逢对手」的下句应该是「把把落荒」。（我改的。）", "我不是不会下，我是给对手让分，我心善。", "以后下棋前先拜三下棋盘，气运是不是会好点？", "「黑白分明」不适用于我的棋盘，我的棋盘是灰的。"]}, "master": {"label": "师父型", "icon": "🎓", "desc": "想被指点", "quotes": ["小友，一手棋看三年功夫。今日一手，胜过明日十手空想。", "棋道之精，不在多，在于专。今日一子，即是一课。", "初学者贪多，中手贪快，高手贪静。你今日在哪一层？", "手筋易学，大局难修。你先摆一子，我们再谈大局。", "记住：先看全局，再看一手。眼里有天地，手中才有分寸。", "败棋不弃，胜棋不骄。这是你今日该守的两条。", "「不失先手」不是不让，而是知道何时该让。", "手谈无言，谈的是心境。你今日心境如何？", "棋盘上藏着三重关：手筋、气势、心法。你在哪一关？", "「弃子争先」的道理，很多人一辈子学不会。你今日试着弃一颗。", "为师告诉你：别人的棋是别人的路，你的棋只能你自己走。", "复盘之要，不在找错，而在找懂。", "落子如种树，今日一子，十年才见其枝繁。", "求快求胜，是初学者的心。求稳求悟，是老者的心。", "一盘棋能改变一天，一年棋能改变一生。莫小看今日一手。", "「不争而胜」是境界，但先要学会争。", "眼中有子，心中有势——先练前者，再修后者。", "为师看过太多天才夭折，只因忘了每日一手。你今日别忘。", "输不可怕，可怕的是不知为何输。今日复一盘，明日胜一分。", "手谈之趣，在于「手」字。你的手，就是你的心。", "记住这句：「棋高一着，缚手缚脚」——你今日别被「高」字困住。", "小友，急躁是棋手的第一大敌。落一子前，先呼吸三次。", "「当局者迷，旁观者清」——你有时也做做自己的旁观者。", "为师年轻时也懒过。补回来的路很长，不如今日一手。", "别问何时能成高手，先问今日有没有一手。", "「棋无第一手」——每一手都可能是妙手，每一手都可能是败手。", "记住：好棋是练出来的，不是等出来的。", "有些棋要下十年才懂，有些棋只需一秒就懂。你今日该下哪种？", "手中一颗子，胜过书架一整排棋谱。", "为师一句话赠你：「棋在纸上，路在脚下。」今日一手，走一步。"]}};
  var DAILY_SIGN = [{"text": "山僧对棋坐，局上竹阴清。", "source": "白居易《池上二绝》"}, {"text": "闲敲棋子落灯花。", "source": "赵师秀《约客》"}, {"text": "偶来松树下，高枕石头眠。", "source": "太上隐者《答人》"}, {"text": "行到水穷处，坐看云起时。", "source": "王维《终南别业》"}, {"text": "白云回望合，青霭入看无。", "source": "王维《终南山》"}, {"text": "松下问童子，言师采药去。", "source": "贾岛《寻隐者不遇》"}, {"text": "野桥经雨断，涧水向田分。", "source": "唐 佚名"}, {"text": "对局如对镜，一手照见半生。", "source": "手谈古语"}, {"text": "半窗明月，一枰残棋。", "source": "宋人棋话"}, {"text": "一叶落知天下秋，一子落知今日心。", "source": "手谈古语"}, {"text": "金角银边草肚皮。", "source": "围棋谚语"}, {"text": "宁失一子，不失一先。", "source": "围棋谚语"}, {"text": "两番收官胜过一步妙手。", "source": "围棋谚语"}, {"text": "势孤取和，实空取胜。", "source": "围棋谚语"}, {"text": "逢危须弃。", "source": "《棋经十三篇》"}, {"text": "彼强自保，势孤取和。", "source": "《棋经十三篇》"}, {"text": "有先手就下先手。", "source": "围棋谚语"}, {"text": "落子无悔，君子之约。", "source": "手谈古训"}, {"text": "棋从断处生。", "source": "围棋谚语"}, {"text": "宁数一目，勿弃一线。", "source": "围棋谚语"}, {"text": "棋道一百，我只知七。", "source": "藤泽秀行"}, {"text": "围棋的目的是把好棋下出来，不是把对手打败。", "source": "吴清源"}, {"text": "六合之棋，超越胜负。", "source": "吴清源"}, {"text": "流水不争先。", "source": "高川格"}, {"text": "宇宙流，看的不是一角，是整盘天地。", "source": "武宫正树"}, {"text": "先看全局，再看一手。", "source": "陈祖德《超越自我》"}, {"text": "棋逢知己，胜负不重要。", "source": "聂卫平"}, {"text": "一手棋，看三年功夫。", "source": "古老棋训"}, {"text": "手筋易学，大局难修。", "source": "围棋谚语"}, {"text": "败者，无一言。", "source": "本因坊道策"}, {"text": "胜固欣然，败亦可喜。", "source": "苏轼《观棋》"}, {"text": "一枰春色，两袖清风。", "source": "文人棋话"}, {"text": "对坐清风里，无言胜有言。", "source": "文人棋话"}, {"text": "青衫落魄不必愁，一子当空胜万筹。", "source": "宋人棋诗"}, {"text": "闲敲棋子夜灯花，一子入盘天地大。", "source": "文人棋话"}, {"text": "落雪时节，一子如梅，一子如霜。", "source": "文人棋话"}, {"text": "对着棋盘，恍见太古之风。", "source": "文人棋话"}, {"text": "十九路间藏山河，一手一手走乾坤。", "source": "文人棋话"}, {"text": "洞庭西望楚江分，落子一声江水深。", "source": "化用李白"}, {"text": "君子矜而不争，群而不党。", "source": "《论语》·适用于棋道"}];
  var LUCK_SIGNS = [{"id": "L01", "name": "飞龙在天", "level": "上上签", "verse": ["长空万里，云破月来", "落子无声，破敌于形", "天时地利，应者云集", "今日之棋，龙腾九霄"], "advice": "气势正盛之日，宜主动出击。教学如是，家事亦然。"}, {"id": "L02", "name": "天元定势", "level": "上上签", "verse": ["一子当中，四海归一", "心无旁骛，势自成局", "大道至简，妙手天成", "布局既定，胜负早分"], "advice": "思路清明、格局宏大之日，凡事顺势而为便有大成。"}, {"id": "L03", "name": "紫气东来", "level": "上上签", "verse": ["东方既白，紫气盈门", "贵人相助，暗手自开", "落子如刀，一击破关", "今日之运，福至心灵"], "advice": "好运叩门之日，善抓机遇即得成事。"}, {"id": "L04", "name": "一剑封喉", "level": "上上签", "verse": ["千算万算，只在一子", "藏锋于内，杀气不显", "时机既到，霹雳而下", "一招定局，无需回眸"], "advice": "果断出手之日，机不可失，犹豫即失先手。"}, {"id": "L05", "name": "金榜题名", "level": "上上签", "verse": ["十年寒窗，一朝金榜", "落子如笔，行棋如章", "前程似锦，明月照堂", "今日之势，如愿以偿"], "advice": "成就落定之日，付出终有回响，别忘记庆祝。"}, {"id": "L06", "name": "白鹤展翅", "level": "大吉", "verse": ["云横秦岭，雪拥蓝关", "一鹤凌云，白衣飘然", "落子从容，步步为营", "大势在我，何须多言"], "advice": "机会已至，稳中求进。忌急躁，宜从容布势。"}, {"id": "L07", "name": "云开见日", "level": "大吉", "verse": ["昨夜风雨，晨起云散", "阳光破雾，山色新鲜", "昔日困局，今朝豁然", "一子既落，前路自开"], "advice": "过去几日的沉闷今日消散，抓住这份清明推进要事。"}, {"id": "L08", "name": "春风得意", "level": "大吉", "verse": ["长安花放，马蹄轻快", "落子有神，思绪如泉", "今日之棋，处处生机", "春风拂面，何等自在"], "advice": "心情舒畅带来判断准确，趁着状态好把要紧的事推一推。"}, {"id": "L09", "name": "明月出关", "level": "大吉", "verse": ["关山万里，孤月一轮", "冷光如剑，照破重雾", "落子清冷，气势内敛", "今日之势，皎洁分明"], "advice": "清醒判断之日，看得透局面本质，宜作重大决策。"}, {"id": "L10", "name": "金鸡独立", "level": "大吉", "verse": ["一足撑天，气定神闲", "独立不动，八方来朝", "定力既强，风雨不惊", "今日之棋，自成一格"], "advice": "稳如泰山之日，不受外界干扰，坚持己见即胜。"}, {"id": "L11", "name": "雪压青松", "level": "大吉", "verse": ["大雪压枝，青松不屈", "越是艰难，越见风骨", "落子如钉，一步一稳", "今日之势，愈挫愈强"], "advice": "抗压能力大爆发，困境反而激出好棋。"}, {"id": "L12", "name": "龙翔九天", "level": "大吉", "verse": ["九霄之上，云卷云舒", "一飞冲天，睥睨四方", "昔日蛰伏，今朝腾达", "落子无形，胜势无边"], "advice": "厚积薄发之日，之前的准备今日兑现。"}, {"id": "L13", "name": "虎跃深山", "level": "大吉", "verse": ["潜行深山，蓄势已久", "一跃而起，山鸣谷应", "落子如虎，威风八面", "今日之棋，霸气自生"], "advice": "胆气正盛之日，敢于挑战强手，也易得意外收获。"}, {"id": "L14", "name": "凤仪千岫", "level": "大吉", "verse": ["五彩华光，凤鸣朝阳", "落子如舞，行云流水", "今日之棋，美不胜收", "一举一动，皆是章法"], "advice": "创造力爆棚之日，容易下出漂亮的手筋。"}, {"id": "L15", "name": "松下问童", "level": "大吉", "verse": ["山中日月，静如止水", "松下问童，云深不知", "今日之势，出尘脱俗", "落子无争，自有天地"], "advice": "气度从容之日，不与人争而胜自成。"}, {"id": "L16", "name": "柳暗花明", "level": "中吉", "verse": ["山重水复，路窄天低", "忽见村舍，又是一春", "棋势将转，忍字为先", "静待其变，柳暗花明"], "advice": "局面暂显被动，转机就在半盘外。多观察，少妄动。"}, {"id": "L17", "name": "山水相逢", "level": "中吉", "verse": ["青山依旧，绿水长流", "昔日棋友，今朝相逢", "落子交心，各有所得", "今日之棋，缘分自成"], "advice": "贵人相助之日，多与人交流复盘，收获意外。"}, {"id": "L18", "name": "老树逢春", "level": "中吉", "verse": ["老干虬枝，久无生机", "春风一至，新芽萌发", "昔日困局，今得转机", "落子如春，处处生意"], "advice": "老问题突然找到解法，别忽视这份新意。"}, {"id": "L19", "name": "静水流深", "level": "中吉", "verse": ["表面平静，暗涌千寻", "藏锋于底，蓄势于沉", "落子无声，思虑无穷", "今日之势，深不可测"], "advice": "思考深度之日，看似平常的一步可能大有玄机。"}, {"id": "L20", "name": "秋收之势", "level": "中吉", "verse": ["春耕夏种，秋收在望", "稻穗低垂，气象丰盈", "昔日之功，今朝可享", "落子从容，收获自成"], "advice": "兑现之日，之前的伏笔今日结果，别错过。"}, {"id": "L21", "name": "迎风扬帆", "level": "中吉", "verse": ["江河浩荡，逆风亦扬", "借力打力，顺势而为", "落子如帆，御风而行", "今日之棋，进退自如"], "advice": "善用外力之日。别硬扛，借势更快。"}, {"id": "L22", "name": "听雨观棋", "level": "中吉", "verse": ["檐前雨落，棋盘静置", "一子未落，思虑千回", "今日之势，宜观宜思", "慢工出品，胜负不急"], "advice": "适合复盘思考之日，不必急着行动。"}, {"id": "L23", "name": "晓风残月", "level": "中吉", "verse": ["一夜风狂，晨起微寒", "残月犹在，晨光初起", "昔日局面，尚可回旋", "今日之棋，冷静应对"], "advice": "昨日阴影尚存，今日冷静处理即无大碍。"}, {"id": "L24", "name": "借东风势", "level": "中吉", "verse": ["万事俱备，只欠东风", "时机将至，蓄势而发", "落子如箭，一发中的", "今日之势，天时正合"], "advice": "等待多时的机会终于成熟，别再犹豫。"}, {"id": "L25", "name": "山雨欲来", "level": "中吉", "verse": ["云压山低，风急水寒", "变数将起，格局将换", "落子谨慎，进退有度", "今日之棋，未雨绸缪"], "advice": "局势即将变化，提前准备好应对，不要被打乱。"}, {"id": "L26", "name": "细水长流", "level": "小吉", "verse": ["溪水潺潺，石上生苔", "不争不抢，自成一派", "今日之势，蓄而不发", "待到来日，万木争春"], "advice": "不必强求突破，慢慢积累即是胜势。"}, {"id": "L27", "name": "蓄势待发", "level": "小吉", "verse": ["弓已张满，箭在弦上", "时机未到，暂且沉稳", "落子如常，眼观八方", "今日之棋，静中有备"], "advice": "不出彩但也不出错，稳住即胜。"}, {"id": "L28", "name": "稳中求胜", "level": "小吉", "verse": ["一步一稳，如履薄冰", "不求华丽，只求周全", "落子踏实，思虑周密", "今日之势，成于稳字"], "advice": "今日不需要奇招，稳定发挥最重要。"}, {"id": "L29", "name": "借力打力", "level": "小吉", "verse": ["顺势而下，四两千斤", "不与人硬，只借人势", "落子如水，无形无迹", "今日之棋，柔中带刚"], "advice": "不要硬碰硬，借对方的力反而更省。"}, {"id": "L30", "name": "一步一景", "level": "小吉", "verse": ["走走看看，处处皆景", "落子不急，心境正好", "今日之棋，随缘自在", "一子一得，何其从容"], "advice": "过程比结果重要之日，享受每一步。"}, {"id": "L31", "name": "稳如磐石", "level": "小吉", "verse": ["山不动，云不惊", "立于其中，八风不摇", "落子沉稳，一子一实", "今日之势，稳字为先"], "advice": "稳定发挥即可，别追求突破。"}, {"id": "L32", "name": "月照池塘", "level": "小吉", "verse": ["明月一轮，池水一泓", "静观其变，倒影自明", "落子从容，不惊不惧", "今日之棋，心境如水"], "advice": "心态平和之日，下棋处事都不易冲动。"}, {"id": "L33", "name": "松间落子", "level": "小吉", "verse": ["松风阵阵，棋盘寂寂", "一子既落，山鸣谷应", "今日之势，简洁明了", "落子无声，得势有形"], "advice": "思路简洁清晰之日，不必想太复杂。"}, {"id": "L34", "name": "雁字南飞", "level": "小吉", "verse": ["一雁横空，成行成序", "有条不紊，各就其位", "落子有章，行棋有法", "今日之棋，井然自成"], "advice": "按部就班之日，别打乱自己的节奏。"}, {"id": "L35", "name": "溪桥独坐", "level": "小吉", "verse": ["溪水潺潺，桥影如画", "独坐观棋，物我两忘", "落子随心，无所强求", "今日之势，闲适自得"], "advice": "轻松心态反而下出好棋。"}, {"id": "L36", "name": "闲云野鹤", "level": "小吉", "verse": ["天高云淡，鹤舞长空", "无拘无束，自由自在", "落子如风，行棋如水", "今日之棋，随心所欲"], "advice": "不功利之日，反而超常发挥。"}, {"id": "L37", "name": "半日闲棋", "level": "小吉", "verse": ["手中一子，眼前一局", "半日光阴，浮生偷得", "今日之势，得失皆宜", "落子从容，胜负不问"], "advice": "享受下棋本身，胜负是副产品。"}, {"id": "L38", "name": "静观其变", "level": "平", "verse": ["云卷云舒，花开花落", "万事有序，不必躁动", "今日之势，等字为先", "落子从缓，胜负未定"], "advice": "不知道下什么就先不下，等待更清楚的信号。"}, {"id": "L39", "name": "收敛锋芒", "level": "平", "verse": ["剑归鞘中，锋芒暂敛", "不显山露水，才是高手", "今日之棋，低调为宜", "落子如常，不惹是非"], "advice": "不出头之日，低调处事反而顺利。"}, {"id": "L40", "name": "待时而动", "level": "平", "verse": ["万事俱备，唯待东风", "沉稳蓄力，一刻不松", "今日之势，忍字当先", "落子从容，等风来时"], "advice": "机会未到，急躁只会坏事。"}, {"id": "L41", "name": "顺其自然", "level": "平", "verse": ["水到渠成，瓜熟蒂落", "不强求，不勉强", "今日之棋，随缘自在", "落子如常，得失从心"], "advice": "不强求任何结果，随缘就好。"}, {"id": "L42", "name": "观棋不语", "level": "平", "verse": ["旁观者清，当局者迷", "今日闲坐，看人下棋", "学在其中，悟在其外", "落子未定，静字为先"], "advice": "适合复盘、学习、看别人下的日子。"}, {"id": "L43", "name": "平心静气", "level": "平", "verse": ["心如止水，气若清风", "不喜不悲，不惊不惧", "今日之棋，稳字当头", "落子如常，波澜不惊"], "advice": "情绪稳定之日，下棋处事都平顺。"}, {"id": "L44", "name": "知白守黑", "level": "平", "verse": ["明处见白，暗处守黑", "有形有法，无形无迹", "今日之势，虚实相生", "落子如常，攻守自如"], "advice": "懂得进退之日，有些地方该守就守。"}, {"id": "L45", "name": "子从心出", "level": "平", "verse": ["手随心动，子从意生", "不问吉凶，只求本真", "今日之棋，一子一诚", "落子无悔，天地自宽"], "advice": "跟着直觉走的日子，想太多反而错。"}, {"id": "L46", "name": "黑云过山", "level": "小凶", "verse": ["乌云压顶，山色阴沉", "风起云涌，暂避为宜", "今日之势，守多于攻", "落子谨慎，切莫强求"], "advice": "势有不利，暂避锋芒，等风头过去再动。"}, {"id": "L47", "name": "孤舟蓑笠", "level": "小凶", "verse": ["千山鸟飞尽，万径人踪灭", "孤舟蓑笠翁，独钓寒江雪", "今日之局，独木难支", "宜守勿攻，心宽自安"], "advice": "势有不利，暂避锋芒。此时的克制，是明日的伏笔。"}, {"id": "L48", "name": "迂回退避", "level": "小凶", "verse": ["前路有阻，转而绕行", "曲径通幽，殊途同归", "今日之势，退一步海阔", "落子避锋，另辟蹊径"], "advice": "正面冲突不利，换个路径更快。"}, {"id": "L49", "name": "月落西山", "level": "小凶", "verse": ["月已西斜，晨光未起", "昼夜交替，明暗未分", "今日之势，忍字最要", "落子从缓，静待天明"], "advice": "不上不下之日，多等等，别急着行动。"}, {"id": "L50", "name": "风雨兼程", "level": "小凶", "verse": ["风紧雨密，步履维艰", "咬牙坚持，尚可前行", "今日之棋，苦中求进", "落子谨慎，进退有节"], "advice": "艰难之日，坚持一下就过去了。"}, {"id": "L51", "name": "秋叶零落", "level": "小凶", "verse": ["一叶落下，天下皆秋", "昔日繁华，今朝凋零", "今日之势，休养为先", "落子从简，不求突破"], "advice": "状态下滑之日，少做多歇。"}, {"id": "L52", "name": "独木难支", "level": "中凶", "verse": ["大厦将倾，一木难支", "力有不逮，勿强为之", "今日之势，认清即胜", "落子从简，不作困兽斗"], "advice": "形势不利就承认，硬撑只会更累。"}, {"id": "L53", "name": "满盘皆输", "level": "中凶", "verse": ["一子错定，满盘皆非", "反思过往，方能新生", "今日之势，宜复盘不宜再战", "收子认负，另作打算"], "advice": "今日的输局是明日的教材，别急着扳回。"}, {"id": "L54", "name": "风声鹤唳", "level": "中凶", "verse": ["草木皆兵，风声鹤唳", "神经紧绷，越紧越乱", "今日之势，暂避为宜", "落子从简，勿多思虑"], "advice": "越焦虑越出错，今天不适合作关键决定。"}];
  var LEVEL_WEIGHTS = {"上上签": 5, "大吉": 12, "中吉": 20, "小吉": 25, "平": 20, "小凶": 12, "中凶": 6};
  var LEVEL_COLORS = {"上上签": "#8b1a1a", "大吉": "#a94b3d", "中吉": "#c17c3f", "小吉": "#8b7550", "平": "#5f6b6d", "小凶": "#4a5057", "中凶": "#2a2a2a"};
    
;
  var STYLE_LABELS = {
    gentle:'温柔治愈', spicy:'辛辣毒舌', backup:'铁哥后援', classic:'古风典雅',
    burning:'热血燃系', zen:'禅意清净', joke:'搞笑吐槽', master:'大师引言'
  };
  var STYLE_KEYS = Object.keys(STYLE_LABELS);

  var STORAGE_DAYS = 'luobo_days';        // 共享打卡日期集
  var STORAGE_TEACHER = 'luobo_teacher_config';
  var STORAGE_LUCK_TODAY = 'luobo_luck_today';
  var STORAGE_LAST_STYLE = 'luobo_last_style';
  var STORAGE_LAST_TEACHER = 'luobo_last_teacher_ids';
  var STORAGE_LUOBO_TODAY = 'luobo_checkin_today';  // v3.11 fix6：今日语录快照（每日一次）

  // ============ 工具函数 ============
  function $(id) { return document.getElementById(id); }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
  }
  function readJSON(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }
  function showToast(msg) {
    var t = $('dr-toast'); if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 1600);
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ============ 打卡日历 ============
  function markToday() {
    var days = readJSON(STORAGE_DAYS, []);
    var k = todayKey();
    if (days.indexOf(k) === -1) {
      days.push(k);
      writeJSON(STORAGE_DAYS, days);
    }
    renderCalendar();
  }
  function renderCalendar() {
    var grid = $('dr-cal-grid');
    if (!grid) return;
    var days = readJSON(STORAGE_DAYS, []);
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth();
    var lastDay = new Date(y, m+1, 0).getDate();
    var todayD = now.getDate();
    var monthChecked = 0;
    grid.innerHTML = '';
    for (var d = 1; d <= lastDay; d++) {
      var key = y + '-' + (m+1) + '-' + d;
      var cell = document.createElement('div');
      cell.className = 'dr-cal-day';
      cell.textContent = d;
      if (days.indexOf(key) !== -1) { cell.classList.add('checked'); monthChecked++; }
      if (d === todayD) cell.classList.add('today');
      grid.appendChild(cell);
    }
    var cnt = $('dr-cal-count'); if (cnt) cnt.textContent = monthChecked + ' 天';
    // fix16 · 同步更新 header 副标题打卡数
    var hcnt = $('dr-header-count'); if (hcnt) hcnt.textContent = days.length;
  }

  // ============ Tab 切换 ============
  function switchTab(name) {
    var btns = document.querySelectorAll('.dr-tab-btn');
    for (var i=0;i<btns.length;i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-tab') === name);
    }
    var panels = ['luobo','luck','teacher'];
    for (var j=0;j<panels.length;j++) {
      var p = $('dr-tab-' + panels[j]);
      if (p) p.classList.toggle('active', panels[j] === name);
    }
    // v3.11 fix6：首次切到 luobo/luck 时按 localStorage 决定视图态；不再自动 renderLuoboQuote / drawLuck
    if (name === 'luobo') { syncLuoboView(); }
    if (name === 'luck')  { syncLuckView(); }
    if (name === 'teacher') {
      // 五期：teacher_cards.js 按需加载
      var ensureTeacher = function(){
        var cfg = readJSON(STORAGE_TEACHER, null);
        if (!cfg) { openTeacherConfig(); }
        else if (!$('teacher-title').__inited) { renderTeacherCard(); $('teacher-title').__inited = true; }
      };
      if (typeof TEACHER_CARDS === 'undefined') {
        window.__luoboLoadScript('/assets/data/teacher_cards.js').then(ensureTeacher);
      } else {
        ensureTeacher();
      }
    }
  }

  // ============ 抽屉开关 ============
  function openPanel(tab) {
    var mask = $('daily-ritual-mask'), panel = $('daily-ritual-panel');
    if (!mask || !panel) return;
    mask.classList.add('show');
    panel.classList.add('show');
    document.body.style.overflow = 'hidden';
    renderCalendar();
    // v3.11 fix6：不再自动 renderLuoboQuote；按 localStorage 决定视图态
    syncLuoboView();
    if (tab) switchTab(tab);
  }
  function closePanel() {
    var mask = $('daily-ritual-mask'), panel = $('daily-ritual-panel');
    if (mask) mask.classList.remove('show');
    if (panel) panel.classList.remove('show');
    document.body.style.overflow = '';
    // 顺便关闭定制向导
    var cm = $('dr-teacher-config-modal');
    if (cm) cm.classList.remove('show');
  }

  // ============ 萝卜精 tab（v3.11 fix6 · 双态盲盒） ============

  // 切换到指定视图（cover / result）
  function setLuoboView(view) {
    var cover = $('dr-luobo-cover'), result = $('dr-luobo-result');
    if (!cover || !result) return;
    cover.classList.toggle('active', view === 'cover');
    result.classList.toggle('active', view === 'result');
    if (view === 'result') {
      result.classList.remove('dr-result-fade');
      // 强制 reflow，重启动画
      void result.offsetWidth;
      result.classList.add('dr-result-fade');
    }
  }

  // 按 localStorage 决定应显示哪个视图
  function syncLuoboView() {
    var stored = readJSON(STORAGE_LUOBO_TODAY, null);
    if (stored && stored.date === todayKey() && stored.style && stored.text) {
      // 今日已打卡：直接进入结果态，渲染当天的语录快照
      renderLuoboQuoteFromSnapshot(stored);
      setLuoboView('result');
    } else {
      // 未打卡：抽奖态
      setLuoboView('cover');
    }
  }

  // 生成新语录并写入今日快照
  function pickAndSaveLuoboQuote() {
    var lastStyle = localStorage.getItem(STORAGE_LAST_STYLE) || '';
    var pool = STYLE_KEYS.filter(function(k) { return k !== lastStyle; });
    var style = pick(pool);
    localStorage.setItem(STORAGE_LAST_STYLE, style);
    var q = pick(QUOTES[style].quotes);
    var text = (typeof q === 'string') ? q : (q.text || '');
    var s = pick(DAILY_SIGN);
    var snapshot = {
      date: todayKey(),
      style: style,
      label: QUOTES[style].label || STYLE_LABELS[style],
      icon: QUOTES[style].icon || '',
      text: text,
      signText: s.text,
      signSource: s.source
    };
    writeJSON(STORAGE_LUOBO_TODAY, snapshot);
    return snapshot;
  }

  // 从快照渲染 DOM
  function renderLuoboQuoteFromSnapshot(snap) {
    if (!snap) return;
    // badge 内置隐藏，仅用于内部记录风格类别
    var badge = $('luobo-style-badge');
    if (badge) badge.textContent = snap.label || '';
    $('luobo-quote-text').textContent = snap.text;
    $('luobo-quote-tag').textContent = '— 萝卜精' + (snap.icon ? ' ' + snap.icon : '');
    $('luobo-sign-text').textContent = snap.signText;
    $('luobo-sign-source').textContent = '— ' + snap.signSource;
  }

  // 兼容旧钩子：保留 renderLuoboQuote，内部调新逻辑
  function renderLuoboQuote() {
    var snap = pickAndSaveLuoboQuote();
    renderLuoboQuoteFromSnapshot(snap);
  }

  // 今日打卡：盲盒动画 + 抽签 + 切视图
  function luoboCheckin() {
    // 若今日已打卡，直接切到结果态（防重放）
    var stored = readJSON(STORAGE_LUOBO_TODAY, null);
    if (stored && stored.date === todayKey() && stored.text) {
      renderLuoboQuoteFromSnapshot(stored);
      setLuoboView('result');
      showToast('今日已打卡');
      return;
    }
    var btn = $('dr-luobo-cover-btn');
    var icon = $('dr-luobo-icon');
    if (btn) btn.disabled = true;
    if (icon) {
      icon.classList.remove('flipping');
      void icon.offsetWidth;
      icon.classList.add('flipping');
    }
    // 动画期间抽签，动画结束后切视图
    setTimeout(function() {
      var snap = pickAndSaveLuoboQuote();
      renderLuoboQuoteFromSnapshot(snap);
      markToday();
      // 3.6 打卡仪式感：今日格"落子"着陆动画
      var todayCell = document.querySelector('.dr-cal-day.today.checked');
      if (todayCell) {
        todayCell.classList.add('stone-land');
        setTimeout(function(){ todayCell.classList.remove('stone-land'); }, 600);
      }
      setLuoboView('result');
      if (btn) btn.disabled = false;
      showToast('打卡成功');
    }, 620);
  }

  // ============ 每日棋运 tab（v3.11 fix6 · 摇签盲盒） ============
  function weightedPickLuck() {
    // 计算总权重
    var total = 0;
    for (var i=0;i<LUCK_SIGNS.length;i++) {
      total += (LEVEL_WEIGHTS[LUCK_SIGNS[i].level] || 1);
    }
    var r = Math.random() * total;
    var acc = 0;
    for (var j=0;j<LUCK_SIGNS.length;j++) {
      acc += (LEVEL_WEIGHTS[LUCK_SIGNS[j].level] || 1);
      if (r <= acc) return LUCK_SIGNS[j];
    }
    return LUCK_SIGNS[0];
  }

  // 切换到指定视图（cover / result）
  function setLuckView(view) {
    var cover = $('dr-luck-cover'), result = $('dr-luck-result');
    if (!cover || !result) return;
    cover.classList.toggle('active', view === 'cover');
    result.classList.toggle('active', view === 'result');
    if (view === 'result') {
      result.classList.remove('dr-result-fade');
      void result.offsetWidth;
      result.classList.add('dr-result-fade');
    }
  }

  // 按 localStorage 决定应显示哪个视图
  function syncLuckView() {
    var stored = readJSON(STORAGE_LUCK_TODAY, null);
    if (stored && stored.date === todayKey() && stored.id) {
      var sign = null;
      for (var i=0;i<LUCK_SIGNS.length;i++) {
        if (LUCK_SIGNS[i].id === stored.id) { sign = LUCK_SIGNS[i]; break; }
      }
      if (sign) {
        renderLuck(sign);
        setLuckView('result');
        return;
      }
    }
    setLuckView('cover');
  }

  // 摇签：动画 + 抽签 + 切视图（每日一次）
  function drawLuck() {
    // 已抽过：直接进入结果态
    var stored = readJSON(STORAGE_LUCK_TODAY, null);
    if (stored && stored.date === todayKey() && stored.id) {
      var existing = null;
      for (var i=0;i<LUCK_SIGNS.length;i++) {
        if (LUCK_SIGNS[i].id === stored.id) { existing = LUCK_SIGNS[i]; break; }
      }
      if (existing) {
        renderLuck(existing);
        setLuckView('result');
        showToast('今日已摇签');
        return;
      }
    }
    var btn = $('dr-luck-cover-btn');
    var icon = $('dr-luck-icon');
    if (btn) btn.disabled = true;
    if (icon) {
      icon.classList.remove('spinning');
      void icon.offsetWidth;
      icon.classList.add('spinning');
    }
    setTimeout(function() {
      var sign = weightedPickLuck();
      writeJSON(STORAGE_LUCK_TODAY, { date: todayKey(), id: sign.id });
      renderLuck(sign);
      markToday();
      setLuckView('result');
      if (btn) btn.disabled = false;
      showToast('已摇 · ' + sign.level);
    }, 580);
  }

  function renderLuck(sign) {
    $('luck-name').textContent = sign.name;
    $('luck-level-badge').textContent = sign.level;
    var color = LEVEL_COLORS[sign.level] || '#8b1a1a';
    $('luck-level-badge').style.background = color;
    $('luck-name').style.color = color;
    var verse = $('luck-verse');
    verse.innerHTML = '';
    for (var i=0;i<sign.verse.length;i++) {
      var line = document.createElement('div');
      line.className = 'luck-verse-line';
      line.textContent = sign.verse[i];
      verse.appendChild(line);
    }
    $('luck-advice').textContent = sign.advice;
  }

  // ============ 教师文案卡 tab ============
  function openTeacherConfig() {
    var m = $('dr-teacher-config-modal');
    if (m) m.classList.add('show');
    var cfg = readJSON(STORAGE_TEACHER, null) || {};
    // 恢复已选
    selectConfigOpt('cfg-position-options', cfg.position);
    selectConfigOpt('cfg-tone-options', cfg.tone);
    if (cfg.signature) $('cfg-signature-input').value = cfg.signature;
    updateConfigConfirmBtn();
  }
  function selectConfigOpt(containerId, value) {
    var opts = document.querySelectorAll('#' + containerId + ' .dr-config-opt');
    for (var i=0;i<opts.length;i++) {
      opts[i].classList.toggle('selected', opts[i].getAttribute('data-value') === value);
    }
  }
  function updateConfigConfirmBtn() {
    var p = document.querySelector('#cfg-position-options .dr-config-opt.selected');
    var t = document.querySelector('#cfg-tone-options .dr-config-opt.selected');
    var btn = $('cfg-confirm-btn');
    if (btn) btn.disabled = !(p && t);
  }
  function teacherConfigConfirm() {
    var p = document.querySelector('#cfg-position-options .dr-config-opt.selected');
    var t = document.querySelector('#cfg-tone-options .dr-config-opt.selected');
    if (!p || !t) { showToast('请选择定位和调性'); return; }
    var sig = $('cfg-signature-input').value.trim();
    var cfg = {
      position: p.getAttribute('data-value'),
      tone: t.getAttribute('data-value'),
      signature: sig
    };
    writeJSON(STORAGE_TEACHER, cfg);
    $('dr-teacher-config-modal').classList.remove('show');
    renderTeacherCard();
    showToast('定制完成');
  }
  function teacherConfigCancel() {
    $('dr-teacher-config-modal').classList.remove('show');
    // 先看看：使用默认（启蒙老师·温和引导）
    var cfg = readJSON(STORAGE_TEACHER, null);
    if (!cfg) {
      writeJSON(STORAGE_TEACHER, { position:'启蒙老师', tone:'温和引导', signature:'', preview:true });
    }
    renderTeacherCard();
  }
  function scoreCard(card, cfg) {
    var s = 0;
    if (card.position === cfg.position) s += 3;
    if (card.tone === cfg.tone) s += 2;
    return s;
  }
  function selectTeacherCard() {
    var cfg = readJSON(STORAGE_TEACHER, { position:'启蒙老师', tone:'温和引导', signature:'' });
    var recent = readJSON(STORAGE_LAST_TEACHER, []);
    // 打分池
    var scored = TEACHER_CARDS.map(function(c) {
      return { card: c, score: scoreCard(c, cfg) };
    });
    // 按分组
    scored.sort(function(a,b) { return b.score - a.score; });
    var maxScore = scored[0].score;
    // 高分池
    var pool = scored.filter(function(x) { return x.score === maxScore; }).map(function(x) { return x.card; });
    // 排除最近 5 张
    var filtered = pool.filter(function(c) { return recent.indexOf(c.id) === -1; });
    if (filtered.length === 0) filtered = pool;  // 池小则允许重复
    // 如果高分池太小（<8），扩到次高分
    if (filtered.length < 8 && scored.length > pool.length) {
      var secondScore = scored[pool.length] ? scored[pool.length].score : 0;
      var extra = scored.filter(function(x) { return x.score === secondScore; }).map(function(x) { return x.card; });
      var extraFiltered = extra.filter(function(c) { return recent.indexOf(c.id) === -1; });
      filtered = filtered.concat(extraFiltered.length ? extraFiltered : extra);
    }
    var card = pick(filtered);
    // 更新历史
    recent.push(card.id);
    if (recent.length > 5) recent.shift();
    writeJSON(STORAGE_LAST_TEACHER, recent);
    return { card: card, cfg: cfg };
  }
  function renderTeacherCard() {
    var r = selectTeacherCard();
    var card = r.card, cfg = r.cfg;
    $('teacher-theme-tag').textContent = card.theme;
    $('teacher-title').textContent = card.title;
    $('teacher-body').textContent = card.body;
    $('teacher-position-hint').textContent = cfg.position + ' · ' + cfg.tone;
    $('teacher-signature').textContent = cfg.signature ? ('— ' + cfg.signature) : '— 老师自填';
  }
  function teacherNext() {
    renderTeacherCard();
    markToday();
  }
  function teacherReconfig() {
    openTeacherConfig();
  }
  function teacherCopyText() {
    var title = $('teacher-title').textContent;
    var body = $('teacher-body').textContent;
    var sig = $('teacher-signature').textContent;
    var text = title + '\n\n' + body + '\n\n' + sig;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('已复制 · 可粘贴到朋友圈');
      }, function() { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
    markToday();
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('已复制'); } catch(e) { showToast('复制失败，请手动选中'); }
    document.body.removeChild(ta);
  }

  // ============ 教师文案卡 · PNG 下载 ============
  function teacherDownloadPNG() {
    var title = $('teacher-title').textContent;
    var body = $('teacher-body').textContent;
    var theme = $('teacher-theme-tag').textContent;
    var sig = $('teacher-signature').textContent;

    var W = 750, H = 1000;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');

    // 背景
    var grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, '#fdfbf5');
    grad.addColorStop(1, '#f5efe0');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    // 边框装饰
    ctx.strokeStyle = 'rgba(139,26,26,.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W-60, H-60);
    ctx.strokeStyle = 'rgba(139,26,26,.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(42, 42, W-84, H-84);

    // 顶部主题标签
    ctx.fillStyle = 'rgba(139,26,26,.08)';
    var tagW = 120, tagH = 32;
    var tagX = (W - tagW) / 2, tagY = 80;
    roundRect(ctx, tagX, tagY, tagW, tagH, 4); ctx.fill();
    ctx.fillStyle = '#8b1a1a';
    ctx.font = '18px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(theme, W/2, tagY + tagH/2);

    // 标题
    ctx.fillStyle = '#8b1a1a';
    ctx.font = 'bold 32px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    wrapText(ctx, title, W/2, 145, W-140, 44, 'center');

    // 分割线
    var titleLines = Math.ceil((title.length * 32) / (W-140));
    var bodyStart = 145 + titleLines * 44 + 24;
    ctx.strokeStyle = 'rgba(139,26,26,.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, bodyStart - 12); ctx.lineTo(W-120, bodyStart - 12);
    ctx.stroke();

    // 正文
    ctx.fillStyle = '#2a2a2a';
    ctx.font = '22px "PingFang SC","STSong",sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    wrapText(ctx, body, 80, bodyStart, W-160, 38, 'left');

    // 底部落款
    ctx.strokeStyle = 'rgba(0,0,0,.1)';
    ctx.beginPath();
    ctx.moveTo(80, H-140); ctx.lineTo(W-80, H-140);
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '16px "PingFang SC",sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(sig, W-80, H-110);

    // 底部品牌水印
    ctx.fillStyle = '#a08b5c';
    ctx.font = '14px "PingFang SC",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('萝卜干聊围棋教育 · 每日棋事簿', W/2, H-70);

    // 下载
    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '教师文案卡_' + Date.now() + '.png';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 500);
      showToast('图片已生成');
      markToday();
    }, 'image/png');
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, align) {
    var chars = text.split('');
    var line = '';
    var offsetY = 0;
    for (var i=0;i<chars.length;i++) {
      var testLine = line + chars[i];
      var testWidth = ctx.measureText(testLine).width;
      if (chars[i] === '\n') {
        ctx.fillText(line, x, y + offsetY);
        line = ''; offsetY += lineHeight;
      } else if (testWidth > maxWidth && line.length > 0) {
        ctx.fillText(line, x, y + offsetY);
        line = chars[i]; offsetY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, x, y + offsetY);
    return offsetY;
  }

  // ============ v3.11 fix6 · 通用竖版卡片 canvas 底 ============
  function _drawCardBase(ctx, W, H) {
    var grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, '#fdfbf5');
    grad.addColorStop(1, '#f5efe0');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(139,26,26,.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W-60, H-60);
    ctx.strokeStyle = 'rgba(139,26,26,.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(42, 42, W-84, H-84);
  }
  function _drawCardBrand(ctx, W, H) {
    ctx.strokeStyle = 'rgba(0,0,0,.1)';
    ctx.beginPath();
    ctx.moveTo(80, H-140); ctx.lineTo(W-80, H-140);
    ctx.stroke();
    ctx.fillStyle = '#a08b5c';
    ctx.font = '14px "PingFang SC",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('萝卜干聊围棋教育 · 每日棋事簿', W/2, H-90);
    ctx.fillStyle = '#8a7550';
    ctx.font = '12px "PingFang SC",sans-serif';
    ctx.fillText(_todayLabel(), W/2, H-68);
  }
  function _todayLabel() {
    var d = new Date();
    var pad = function(n) { return n < 10 ? '0'+n : ''+n; };
    return d.getFullYear() + '.' + pad(d.getMonth()+1) + '.' + pad(d.getDate());
  }
  function _saveCanvas(canvas, filename) {
    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 500);
      showToast('图片已生成');
      markToday();
    }, 'image/png');
  }

  // 萝卜精语录卡 · 保存为图片
  function luoboSaveImage() {
    var snap = readJSON(STORAGE_LUOBO_TODAY, null);
    if (!snap || snap.date !== todayKey() || !snap.text) {
      showToast('请先今日打卡');
      return;
    }
    var W = 750, H = 1000;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    _drawCardBase(ctx, W, H);

    // 顶部主题
    ctx.fillStyle = '#8b1a1a';
    ctx.font = 'bold 30px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('今 日 一 句', W/2, 96);
    ctx.strokeStyle = 'rgba(139,26,26,.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(240, 148); ctx.lineTo(510, 148);
    ctx.stroke();

    // 主语录
    ctx.fillStyle = '#2a2a2a';
    ctx.font = '28px "Songti SC","STSong",serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    var offsetY = wrapText(ctx, snap.text, 90, 200, W-180, 46, 'left');
    var quoteEnd = 200 + offsetY + 46;

    // 落款
    ctx.fillStyle = '#8a7550';
    ctx.font = '18px "Songti SC","STSong",serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('— 萝卜精' + (snap.icon ? ' ' + snap.icon : ''), W-90, quoteEnd + 8);

    // 每日一签盒
    var signY = Math.max(quoteEnd + 80, 620);
    ctx.fillStyle = 'rgba(160,139,92,.10)';
    roundRect(ctx, 80, signY, W-160, 180, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,139,92,.28)';
    ctx.lineWidth = 1;
    roundRect(ctx, 80, signY, W-160, 180, 12);
    ctx.stroke();

    ctx.fillStyle = '#a08b5c';
    ctx.font = '13px "PingFang SC",sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('每 日 一 签', 104, signY + 18);

    ctx.fillStyle = '#3a2a1a';
    ctx.font = '20px "Songti SC","STSong",serif';
    var signOff = wrapText(ctx, snap.signText, 104, signY + 46, W-208, 30, 'left');
    ctx.fillStyle = '#8a7550';
    ctx.font = '13px "PingFang SC",sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('— ' + snap.signSource, W-104, signY + 46 + signOff + 30);

    _drawCardBrand(ctx, W, H);
    _saveCanvas(canvas, '萝卜精语录_' + _todayLabel() + '.png');
  }

  // 卦签 · 保存为图片
  function luckSaveImage() {
    var stored = readJSON(STORAGE_LUCK_TODAY, null);
    if (!stored || stored.date !== todayKey() || !stored.id) {
      showToast('请先摇一签');
      return;
    }
    var sign = null;
    for (var i=0;i<LUCK_SIGNS.length;i++) {
      if (LUCK_SIGNS[i].id === stored.id) { sign = LUCK_SIGNS[i]; break; }
    }
    if (!sign) { showToast('签数据缺失'); return; }

    var W = 750, H = 1000;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    _drawCardBase(ctx, W, H);

    var color = LEVEL_COLORS[sign.level] || '#8b1a1a';

    // 顶部等级 badge
    ctx.fillStyle = color;
    var badgeW = 180, badgeH = 46;
    var badgeX = (W - badgeW) / 2, badgeY = 100;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sign.level, W/2, badgeY + badgeH/2);

    // 签名
    ctx.fillStyle = color;
    ctx.font = 'bold 60px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(sign.name, W/2, 190);

    // 分割线（虚线两条）
    ctx.strokeStyle = 'rgba(139,26,26,.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(120, 290); ctx.lineTo(W-120, 290);
    ctx.stroke();

    // 四句签诗
    ctx.setLineDash([]);
    ctx.fillStyle = '#3a2a1a';
    ctx.font = '26px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var lineY = 320;
    for (var k=0;k<sign.verse.length;k++) {
      ctx.fillText(sign.verse[k], W/2, lineY);
      lineY += 46;
    }

    ctx.strokeStyle = 'rgba(139,26,26,.28)';
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(120, lineY + 8); ctx.lineTo(W-120, lineY + 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // 解签（advice）
    ctx.fillStyle = color;
    ctx.font = 'bold 18px "Songti SC","STSong",serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('解 · ', 90, lineY + 40);
    ctx.fillStyle = '#555';
    ctx.font = '18px "PingFang SC",sans-serif';
    wrapText(ctx, sign.advice, 130, lineY + 40, W-220, 30, 'left');

    _drawCardBrand(ctx, W, H);
    _saveCanvas(canvas, '今日棋运_' + sign.name + '_' + _todayLabel() + '.png');
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    var tabs = document.querySelectorAll('.dr-tab-btn');
    for (var i=0;i<tabs.length;i++) {
      tabs[i].addEventListener('click', function() {
        switchTab(this.getAttribute('data-tab'));
      });
    }
    // 定制向导选项
    var opts = document.querySelectorAll('#cfg-position-options .dr-config-opt, #cfg-tone-options .dr-config-opt');
    for (var j=0;j<opts.length;j++) {
      opts[j].addEventListener('click', function() {
        var parent = this.parentElement;
        var sibs = parent.querySelectorAll('.dr-config-opt');
        for (var k=0;k<sibs.length;k++) sibs[k].classList.remove('selected');
        this.classList.add('selected');
        updateConfigConfirmBtn();
      });
    }
    // ESC 关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        var panel = $('daily-ritual-panel');
        if (panel && panel.classList.contains('show')) closePanel();
      }
    });
  }

  // ============ 暴露全局 ============
  window.__luoboOpenDailyRitual = function(tab) { openPanel(tab); };
  window.__closeDailyRitual = closePanel;
  window.__luoboCheckin = luoboCheckin;
  window.__luckDraw = drawLuck;                  // v3.11 fix6：盲盒版，每日一次
  window.__luoboSaveImage = luoboSaveImage;      // v3.11 fix6：语录卡保存
  window.__luckSaveImage = luckSaveImage;        // v3.11 fix6：卦签保存
  window.__teacherCopyText = teacherCopyText;
  window.__teacherDownloadPNG = teacherDownloadPNG;
  window.__teacherNext = teacherNext;
  window.__teacherReconfig = teacherReconfig;
  window.__teacherConfigConfirm = teacherConfigConfirm;
  window.__teacherConfigCancel = teacherConfigCancel;
  // 兼容旧钩子（v3.10 -> v3.11 过渡）
  window.__luoboOpenLuoboSpirit = function() { openPanel('luobo'); };

  // ============ 初始化 ============
  // fix: 页面加载时同步更新打卡天数显示（不依赖弹窗打开）
  function initHeaderCount() {
    var hcnt = $('dr-header-count');
    if (hcnt) {
      var days = readJSON(STORAGE_DAYS, []);
      hcnt.textContent = days.length;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { bindEvents(); initHeaderCount(); });
  } else {
    bindEvents(); initHeaderCount();
  }

})();
