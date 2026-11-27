/* ===== 能力测试(家长版/教师版)模块 · 按需加载分片 =====
   P0-1(2026-11-25)：原 site.js L837-1231(395 行/44KB，含内联 QUESTIONS 题库)整块迁出。
   触发：#ability-test 首次 .open 时由 site.js __luoboEnsureAbility() 拉取；
   nav-toggle data-role 预选 tab 会 await 本分片加载完成后再 click，避免竞态。
   新增 __luoboAbilityInit 幂等守卫，防止重复绑定。 */
  (function(){
    if (window.__luoboAbilityInit) return; window.__luoboAbilityInit = true;
    const QUESTIONS = {"parent":[{"type":"single","d":"认知理性","q":"孩子输棋后崩溃大哭，你的第一反应是：","opts":[["先什么都不说，让他哭完再谈",5],["'输了没关系，下次赢回来'",4],["'咱们回家不下了'",3],["'你看你不专心/太粗心'",2]],"e":"情绪先落地，道理才进得去。这时讲技术只会让他更抗拒围棋。"},{"type":"single","d":"认知理性","q":"老师说孩子'这半年进步慢'，你的第一反应：","opts":[["问老师'具体卡在哪，我怎么配合'",5],["先歇一歇再学",4],["孩子是不是没天赋",3],["老师是不是不用心",2]],"e":"进步慢往往不是能力问题，是学习方式和陪伴方式的问题。把'找人'变成'找方法'。"},{"type":"single","d":"认知理性","q":"有人说'6 岁不学围棋就晚了'，你怎么看：","opts":[["'早'和'晚'看目标，8-10 岁开始也很好",5],["什么年龄学都可以，天赋决定一切",4],["反正也不是啥事，晚点无所谓",3],["焦虑，赶紧报班",2]],"e":"围棋不是抢跑项目。合适的年龄 + 合适的老师，比'越早越好'重要 10 倍。"},{"type":"single","d":"认知理性","q":"孩子学了 3 个月说'我不想学了'，你会：","opts":[["先问'是老师、同学，还是不喜欢下棋'",5],["'等你再大点回来学'",4],["'你必须坚持完这学期'",3],["'那不学就不学'",2]],"e":"不想学的原因，比不想学本身重要。是学棋苦、没朋友，还是老师不合，处理完全不一样。"},{"type":"single","d":"认知理性","q":"孩子在班里下棋进不了前几名，你的反应：","opts":[["找孩子聊聊他自己怎么看这件事",5],["让孩子转个更擅长的兴趣",4],["加大练习量",3],["立刻换个更好的老师",2]],"e":"名次是结果，不是原因。孩子的看法比你的判断更重要。"},{"type":"judge","d":"认知理性","q":"孩子输了要立刻讲清楚为什么输，否则下次还错。","opts":[["正确",2],["错误",5]],"e":"情绪未落地时讲道理 = 火上浇油。让他先消化情绪，冷静了再复盘。"},{"type":"judge","d":"认知理性","q":"孩子在网棋上很厉害，说明水平真的到了。","opts":[["正确",2],["错误",5]],"e":"网棋和现场对局差异很大。要看正式比赛和面对面复盘的表现。"},{"type":"single","d":"期望管理","q":"零基础 6 岁孩子跟一个好老师，多久到业余 1 级合理？","opts":[["1 年到 1 年半",5],["2-3 年",4],["说不好，看天赋",3],["半年内",2]],"e":"正常节奏 1-2 年到业 1，急不来。半年到 1 级的承诺，通常有水分。"},{"type":"single","d":"期望管理","q":"孩子每天下棋多久合适：","opts":[["30 分钟-1 小时高质量对局 + 复盘",5],["有空就下没空就算",4],["只有上课那天下",3],["越多越好",2]],"e":"量要节制，质要保证。连下 3 小时不如 30 分钟专注 + 认真复盘。"},{"type":"single","d":"期望管理","q":"'学到业余 1 段就够了'这句话，你怎么看：","opts":[["看孩子想到哪，是路上的路牌不是终点",5],["完全认同，兴趣就好",4],["到 5 段才叫真的会下棋",3],["不认同，必须冲专业",2]],"e":"段位是路上的路牌，不是目的地。1 段之后接不接着走，让孩子自己选。"},{"type":"single","d":"期望管理","q":"孩子该不该参加比赛：","opts":[["该比就比，但赛前不加练、赛后一定复盘",5],["跟着老师的节奏来",4],["越多越好，练心态",3],["从来不比赛，怕受伤",2]],"e":"比赛是学棋的一部分，但不是全部。赛前突击 = 毁人，赛后复盘 = 金矿。"},{"type":"single","d":"期望管理","q":"孩子学棋一年的费用，你的态度：","opts":[["匹配家庭承受力，别成负担",5],["动态调整，先试后决定",4],["找性价比高的",3],["越贵越好，好老师值",2]],"e":"教育不是烧钱大赛。稳定的家庭情绪，比昂贵的老师更能出成绩。"},{"type":"judge","d":"期望管理","q":"少儿围棋段位越早拿到越好。","opts":[["正确",2],["错误",5]],"e":"早拿的段位往往有水分。扎实的段位才有意义，晚一年拿也没关系。"},{"type":"judge","d":"期望管理","q":"冲段班一定要报，不然孩子升不了段。","opts":[["正确",2],["错误",5]],"e":"冲段班适合已稳定在业余段位的孩子。级位阶段进冲段班，是揠苗助长。"},{"type":"single","d":"陪伴方式","q":"孩子长考 8 分钟一动不动，你的反应：","opts":[["走开一会儿，让他自己算完",5],["心里急但装作没看见继续等",4],["悄悄凑过去看棋盘想帮他判断",3],["'快点想，别磨叽'",2]],"e":"长考不是磨叽，是他在长脑子。你走开一会儿，就是给他脑子腾出空间。"},{"type":"single","d":"陪伴方式","q":"孩子在家打谱时，你在旁边应该做什么：","opts":[["做点自己的事，别刻意盯着",5],["陪他一起看，不发言",4],["顺便出题考他",3],["玩你的手机",2]],"e":"陪但不盯，让他享受独处的思考。你在，就是安全感。"},{"type":"single","d":"陪伴方式","q":"你会自己也学一点围棋吗：","opts":[["会一点基本规则和术语，能和他聊两句",5],["想学但没时间",4],["不会，专业事交给老师",3],["会，为了监督他有没有偷懒",2]],"e":"不用高段，会基本规则 + 懂点术语就够。父母能'听懂他在说啥'，陪伴质量翻倍。"},{"type":"single","d":"陪伴方式","q":"孩子输棋回家的路上，你和他聊什么：","opts":[["不聊棋，聊别的：吃啥、动画片、学校事",5],["'下次好好准备'",4],["'为什么下错这步'",3],["'下次爸爸/妈妈带你练'",2]],"e":"情绪未落地时讨论技术 = 火上浇油。等他冷静了，第二天再复盘。"},{"type":"single","d":"陪伴方式","q":"孩子和你一起复盘一盘棋，你的角色应该是：","opts":[["提问者，问他每一步在想什么",5],["观众，认真听他讲",4],["记录员，帮他把过程写下来",3],["老师，指出他哪里错了",2]],"e":"复盘不是纠错，是重现他的思考路径。多问 '你当时想的啥'，少说 '你错了'。"},{"type":"judge","d":"陪伴方式","q":"孩子做棋题时家长应该在旁边监督不许分心。","opts":[["正确",2],["错误",5]],"e":"监督式陪伴让孩子把学棋当苦差事。你只需要提供安静环境，剩下让他自己。"},{"type":"judge","d":"陪伴方式","q":"孩子下网棋时家长最好不看，让他自己下。","opts":[["正确",5],["错误",2]],"e":"网棋是他自己的战场。家长在旁围观会破坏他的节奏和判断。"},{"type":"single","d":"教育视野","q":"让孩子学围棋，你最看重什么：","opts":[["培养一辈子受用的思维方式和心态",5],["开发智力",4],["有个爱好，别人家都学",3],["升学加分",2]],"e":"围棋是长线教育投资，不是短期功利工具。抱着'加分'去学的家庭，孩子一升不了段就走。"},{"type":"single","d":"教育视野","q":"学围棋和学国际象棋/中国象棋冲突吗：","opts":[["建议专攻围棋一门到某个阶段再考虑",5],["都学，但初期分开时段，小心串味",4],["都学，多多益善",3],["冲突，一辈子只能选一个",2]],"e":"棋类思维差异大，初期同学最容易乱套。学稳一门再拓展，是稳妥打法。"},{"type":"single","d":"教育视野","q":"什么时候可以放手让孩子自主发展棋艺：","opts":[["到 1 段以上，家长开始退居幕后",5],["到业 1 就该放手",4],["老师说放就放",3],["一辈子都得盯着",2]],"e":"陪伴是有节奏的。1 段是分水岭，之后你的角色从'教练'变成'队友'。"},{"type":"single","d":"教育视野","q":"如果孩子未来想走职业围棋，你的第一反应：","opts":[["严格评估他的天赋、意志和家庭承受力",5],["让他先冲到某个段位再说",4],["全力支持，请最好的老师",3],["直接拒绝，太苦",2]],"e":"职业不是随口说的路。评估要冷静，别被孩子一时热情或自己虚荣心带偏。"},{"type":"single","d":"教育视野","q":"围棋这个爱好和学习成绩，你怎么排优先级：","opts":[["二者不冲突，都是长期投入",5],["视孩子表现动态调整",4],["围棋优先，学习让路",3],["学习永远第一，围棋随时可停",2]],"e":"围棋和学习不是零和游戏。真正学好围棋的孩子，往往学习也不差。"},{"type":"judge","d":"教育视野","q":"把围棋当作培养专注力的工具，是本末倒置。","opts":[["正确",5],["错误",2]],"e":"围棋值得因为它本身，不是因为它'有用'。把它当工具，孩子会感到被利用。"},{"type":"judge","d":"教育视野","q":"孩子学围棋是为了以后能拿国家段位证书。","opts":[["正确",2],["错误",5]],"e":"证书是副产品，不是目的。以证书为目标，孩子拿到就不想下了。"},{"type":"essay","d":"教育视野","q":"你觉得围棋能带给孩子最重要的一样东西是什么？为什么？","ref":["面对失败和不确定的能力：一盘棋输了不代表一辈子输了","独立思考的习惯：每一步都是自己选的，输赢自己扛","平静的心态：赢不炸、输不散","长线思维：不看一手，看全局；不看一盘，看一年"],"e":"围棋教给孩子的不是'怎么赢'，而是'怎么面对不能全赢的人生'。"},{"type":"essay","d":"教育视野","q":"假如未来 AI 完全能预测棋局胜负，你还愿意让孩子学围棋吗？为什么？","ref":["AI 时代围棋的价值转向'人对人'的沟通和修炼，不再依赖胜负判定","下棋的过程价值 > 结果价值：那 2 小时的专注和思考本身就有意义","围棋是一种审美和文化传承，AI 替代不了'和人对坐'的体验","真正学得深的东西，从来不是靠'能不能算过 AI'来定义价值"],"e":"这道题在测你把围棋看作'技术'还是'教育'。AI 时代能留下的，只有教育。"}],"teacher":[{"type":"single","d":"教学能力","q":"你讲完一个知识点，怎么判断孩子是真听懂了？","opts":[["他能在 3 手内的相似局面里下对",5],["他能自己重新讲一遍给你听",4],["他能做对课后作业",3],["他点头说'懂了'",2]],"e":"孩子说'懂了'的时候，才是最不懂的时候。真懂是能用出来。"},{"type":"single","d":"教学能力","q":"一节课的开场，怎么做最能让孩子快速进入状态：","opts":[["用一道 30 秒能想清楚的小题热身",5],["复盘上节课的作业",4],["让孩子安静坐好再开始",3],["直接讲今天的知识点",2]],"e":"开场 5 分钟决定这节课效率。热身题激活思考惯性，比'快坐好'管用 10 倍。"},{"type":"single","d":"教学能力","q":"孩子做错题时，你的第一反应：","opts":[["反问一句，让他自己发现错在哪",5],["'再想想'",4],["换一道更简单的做",3],["直接告诉他正确答案",2]],"e":"错题是最好的教学素材。你把答案告诉他，就抢走了他的成长机会。"},{"type":"single","d":"教学能力","q":"每次课后，你会花多少时间备下节课：","opts":[["至少 30 分钟，针对这节课孩子的反应做调整",5],["10 分钟看下要点",4],["每个班备一次通用课件",3],["不需要，教案都在脑子里",2]],"e":"好课都是备出来的，尤其是针对每个孩子的调整。通用课件教出通用学生。"},{"type":"single","d":"教学能力","q":"一节 60 分钟的幼儿课，你会怎么设计结构：","opts":[["短热身 + 讲解 + 游戏化练习 + 小结",5],["前一半讲后一半练",4],["让孩子自由下棋，你在旁辅导",3],["全程 60 分钟一对一讲棋",2]],"e":"幼儿注意力周期 10-15 分钟。结构分段 + 游戏化，比 '压得住' 更重要。"},{"type":"judge","d":"教学能力","q":"同一个知识点，一节课讲不透就下节课继续，不用赶进度。","opts":[["正确",5],["错误",2]],"e":"进度是给自己看的，孩子的接受度才是真进度。赶完了没记住，等于没讲。"},{"type":"judge","d":"教学能力","q":"教材应该完全按段位循序渐进，不能跳。","opts":[["正确",2],["错误",5]],"e":"好老师根据孩子的兴趣切入点选题，可以先教吸引人的内容再回补基础。"},{"type":"single","d":"家长沟通","q":"家长问'我孩子学 3 个月还输给同班小朋友，是不是没天赋'，你回：","opts":[["'我周末给你发一份他这 3 个月的成长复盘，咱们看事实，天赋这词太大'",5],["'每个孩子进度不一样'",4],["'别急，慢慢来'",3],["'他专注力还不够'",2]],"e":"家长要事实和方向，不是安慰。你给出数据和判断，他就信你。"},{"type":"single","d":"家长沟通","q":"家长在群里晒孩子刚拿的少儿冠军奖状：","opts":[["群里祝贺 + 私聊给具体建议",5],["群里祝贺",4],["让全班孩子鼓掌",3],["装没看见",2]],"e":"公开庆祝 + 私下泼冷水，既照顾赢家心态，又不让其他家长焦虑。"},{"type":"single","d":"家长沟通","q":"该续费时家长说'再想想'，你的应对：","opts":[["'我给你发一份他这三个月的成长报告，你先看再决定'",5],["'你先在别处看看再决定'",4],["追问犹豫的具体原因",3],["打折促销挽留",2]],"e":"不是留住家长，是让家长看见价值。价值到位了，续费是水到渠成。"},{"type":"single","d":"家长沟通","q":"家长要求'教得快一点，别的机构一年就到 1 段'：","opts":[["'急上去容易垮，我们目标是稳到 1 段能自己继续走'",5],["'咱们的孩子基础还没牢，需要时间'",4],["让家长转班",3],["按对方要求加快节奏",2]],"e":"赢家长的信任要靠敢说不。跟风加速的老师，短期留客，长期毁人。"},{"type":"single","d":"家长沟通","q":"接手一个转介绍新学员，第一次和家长沟通的重点：","opts":[["了解孩子性格、之前学棋经历、家长真实目标",5],["试听一次让家长自己判断",4],["讲清课程价格和课时安排",3],["展示自己的段位和资质",2]],"e":"家长要的不是'你多厉害'，是'你懂不懂我孩子'。第一次沟通不谈自己，谈孩子。"},{"type":"judge","d":"家长沟通","q":"家长质疑你的教学方法，最好的应对是马上调整。","opts":[["正确",2],["错误",5]],"e":"质疑先听清楚，判断有没有道理再决定改不改。盲从家长 = 没主见。"},{"type":"judge","d":"家长沟通","q":"孩子每次课的小问题都应该及时告诉家长，让家长配合。","opts":[["正确",3],["错误",5]],"e":"小问题老师自己消化，大问题及时沟通。事无巨细上报，家长会焦虑。"},{"type":"single","d":"职业理念","q":"一个孩子明显没围棋天赋，你会：","opts":[["找到围棋对他的独特价值（例如培养耐心），继续教",5],["委婉建议家长看看别的兴趣",4],["让他自己走",3],["该教教、该收钱收钱，不多话",2]],"e":"没天赋不代表围棋对他没价值。心性、专注力、抗挫力，围棋都能给。"},{"type":"single","d":"职业理念","q":"遇到胜负心过重、输棋就摔子的孩子：","opts":[["单独聊，让他知道你也输过更多棋",5],["先冷处理，等他自己冷静",4],["让家长带回去教育",3],["当场严厉批评",2]],"e":"孩子的胜负心是老师的必修课，不是家长的责任。你怎么处理，他一辈子记得。"},{"type":"single","d":"职业理念","q":"你怎么看'围棋能开发智力'这句话：","opts":[["是次要价值，不该作为主打",5],["智力是天生的，围棋只是训练场",4],["是营销话术，尽量少用",3],["完全对，就是我们的核心卖点",2]],"e":"围棋的价值远大于'开发智力'。把它当唯一卖点，反而低估了这门学问。"},{"type":"single","d":"职业理念","q":"你带过的学生，10 年后你希望他们是：","opts":[["有人还在下，有人不下了，但都记得从棋里学到的东西",5],["都能拿到某个段位",4],["说不好，那时的事",3],["大部分成为职业棋手",2]],"e":"好老师的成品是'人'，不是'段位'。段位会掉，人格底子会跟他一辈子。"},{"type":"single","d":"职业理念","q":"学生大部分离开你转到大机构时，你的心态：","opts":[["平静接受，重要的是他继续下棋",5],["反思自己哪里做得不够",4],["调整策略防止再流失",3],["生气，觉得白教了",2]],"e":"教育不是所有权游戏。孩子在别的地方继续成长，是你教的成功不是失败。"},{"type":"judge","d":"职业理念","q":"教学中'因材施教'比'统一进度'重要。","opts":[["正确",5],["错误",2]],"e":"孩子不是标准化原料。因材施教是好老师的底线。"},{"type":"judge","d":"职业理念","q":"围棋老师主要靠段位吃饭，段位越高越值钱。","opts":[["正确",2],["错误",5]],"e":"会下不等于会教。段位是入场券，教学是核心竞争力。"},{"type":"single","d":"儿童心理","q":"5 岁幼儿在课堂上突然哭闹不肯下棋，你会：","opts":[["蹲下来问他是累了、饿了还是委屈了",5],["换个游戏转移注意力",4],["让家长把孩子接走休息",3],["严肃说'上课不许哭'",2]],"e":"幼儿哭闹背后往往是生理或情绪信号，不是纪律问题。蹲下来看见他，是第一步。"},{"type":"single","d":"儿童心理","q":"6 岁孩子对局中动手打了赢他的小朋友：","opts":[["立刻分开，冷静 5 分钟后一起谈：'可以生气，但不能打人'",5],["立刻分开，各自送回家长处",4],["严厉批评动手的孩子",3],["让两个孩子自己解决",2]],"e":"情绪管理是围棋教学的一部分。教他把火气'下'到棋盘上，是最有价值的一课。"},{"type":"single","d":"儿童心理","q":"转介绍来的家长第一次上课，你会：","opts":[["花 10 分钟先了解孩子的性格和上一位老师的教法",5],["让家长在旁听，看着教",4],["按平时的流程正常上",3],["表现得特别热情",2]],"e":"转介绍来的家长期待更高，第一课要'看见孩子'，不是表演。"},{"type":"single","d":"儿童心理","q":"孩子明明能下对一步棋，但下课时说'我不会'：","opts":[["判断他是心情不好还是真忘了，分开处理",5],["让他再演示一遍",4],["加强这个知识点的练习",3],["相信他说的，从头教",2]],"e":"孩子说'不会'，可能是真忘了、可能是不想面对、也可能是想要关注。看清楚再动。"},{"type":"single","d":"儿童心理","q":"8 岁孩子和家长在课后争吵不肯回家，你会：","opts":[["蹲下来听两边说，帮他们缓和情绪",5],["请家长在办公室聊",4],["让家长带走别耽误其他事",3],["装没看见继续做其他工作",2]],"e":"你在孩子和家长之间是'第三方'，是最好的缓冲。这时不出手，就是失职。"},{"type":"judge","d":"儿童心理","q":"孩子在课堂上分心，是纪律问题需要管教。","opts":[["正确",2],["错误",5]],"e":"分心多半是内容枯燥或状态问题，先找原因再处理。上来就管教 = 错位。"},{"type":"judge","d":"儿童心理","q":"对幼儿最好用奖励糖果的方式鼓励认真下棋。","opts":[["正确",2],["错误",5]],"e":"外部奖励最终会破坏内在动机。用兴趣本身带他，不用糖果和贴纸。"},{"type":"essay","d":"职业理念","q":"作为围棋老师，你希望教给孩子的第一件事是什么？","ref":["棋礼：尊重对手，落子无悔","面对失败的态度：一盘棋输了不代表你输了","独立思考的勇气：每一手都是自己的选择","下棋和做人一样：不投机、不悔、不装"],"e":"这个问题在测你把学生当'棋手'还是'人'来教。答案里能看出你 10 年后的教学高度。"},{"type":"essay","d":"职业理念","q":"如果一个学生 10 年后回来找你，说'老师你当年教我的那句话让我一辈子受用'，那句话最可能是什么？","ref":["'输一盘棋不代表输给这盘棋'","'每一手都是你自己选的，输赢你自己扛'","'不神化胜负，那只是一场对话'","'下棋和做人一样，长远比一时重要'","主人自己的教育金句"],"e":"能被学生记 10 年的一句话，一定不是关于技术的。是关于人的。"}]};

    const LEVELS = {
      parent: [
        { min: 136, name: '走进围棋的家长', color: '#a8362a', tag: '顶级' },
        { min: 120, name: '教育型家长',     color: '#c94a3a', tag: '优秀' },
        { min: 101, name: '清醒家长',       color: '#8a5a3a', tag: '良好' },
        { min: 85,  name: '用心家长',       color: '#9a8560', tag: '入门' },
        { min: 0,   name: '起步家长',       color: '#6b6b6b', tag: '起步' }
      ],
      teacher: [
        { min: 136, name: '老师中的老师',     color: '#a8362a', tag: '顶级' },
        { min: 120, name: '家长口中的好老师', color: '#c94a3a', tag: '优秀' },
        { min: 101, name: '匠人教师',         color: '#8a5a3a', tag: '良好' },
        { min: 85,  name: '合格教师',         color: '#9a8560', tag: '入门' },
        { min: 0,   name: '新手教师',         color: '#6b6b6b', tag: '起步' }
      ]
    };

    const INTROS = {
      parent: {
        title: '家长版 · 教育认知度测评',
        desc: '这套题面向孩子在学围棋、正在学、或者考虑让孩子学的家长。它不测围棋水平，测的是你作为家长的<span class="hl">教育理念、期望管理、陪伴方式、教育视野</span>四个维度。'
      },
      teacher: {
        title: '教师版 · 教学能力自评',
        desc: '这套题面向围棋教师、机构老师、少儿围棋教练。它不测你的棋力（那是另一件事），测的是<span class="hl">教学能力、家长沟通、职业理念、儿童心理</span>四个维度的综合状态。'
      }
    };

    const TYPE_LABEL = { single: '单选', judge: '判断', essay: '简答' };

    let state = { role: 'parent', idx: 0, answers: [], dimScore: {}, dimMax: {} };

    function computeDimMax(role){
      const dm = {};
      QUESTIONS[role].forEach(q => {
        const m = q.type === 'essay' ? 5 : Math.max.apply(null, q.opts.map(o => o[1]));
        dm[q.d] = (dm[q.d]||0) + m;
      });
      return dm;
    }

    // ===== Tab 切换 =====
    document.querySelectorAll('.test-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.test-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.role = btn.dataset.role;
        document.getElementById('intro-title').textContent = INTROS[state.role].title;
        document.getElementById('intro-desc').innerHTML = INTROS[state.role].desc;
      });
    });

    // ===== 开始测评 =====
    document.getElementById('btn-start').addEventListener('click', () => {
      state.idx = 0;
      state.answers = [];
      state.dimMax = computeDimMax(state.role);
      state.dimScore = {};
      Object.keys(state.dimMax).forEach(k => state.dimScore[k] = 0);
      document.getElementById('test-intro').style.display = 'none';
      document.getElementById('test-selector').style.display = 'none';
      document.getElementById('test-quiz').style.display = 'block';
      renderQuestion();
      (function(){ var p=document.getElementById('ability-test'); if(p&&p.classList.contains('open')) p.scrollTo({top:0,behavior:'smooth'}); })();
    });

    // ===== 渲染题目 =====
    function renderQuestion(){
      const q = QUESTIONS[state.role][state.idx];
      document.getElementById('q-idx').textContent = state.idx + 1;
      document.getElementById('q-dim').textContent = q.d;
      document.getElementById('q-type').textContent = TYPE_LABEL[q.type];
      document.getElementById('q-text').textContent = q.q;
      document.getElementById('progress-fill').style.width = ((state.idx + 1) / 30 * 100) + '%';
      document.getElementById('q-feedback').style.display = 'none';
      document.getElementById('q-opts').style.display = 'none';
      document.getElementById('q-essay').style.display = 'none';

      if (q.type === 'single' || q.type === 'judge') {
        const box = document.getElementById('q-opts');
        box.style.display = 'block';
        box.innerHTML = '';
        q.opts.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'opt-btn';
          btn.textContent = opt[0];
          btn.addEventListener('click', () => {
            Array.from(box.children).forEach(b => { b.disabled = true; b.classList.remove('selected'); });
            btn.classList.add('selected');
            recordScore(opt[1], q);
          });
          box.appendChild(btn);
        });
      } else {
        const box = document.getElementById('q-essay');
        box.style.display = 'block';
        document.getElementById('essay-ref').style.display = 'none';
        document.getElementById('essay-self-eval').style.display = 'none';
        document.getElementById('btn-show-ref').style.display = 'inline-block';
        document.getElementById('btn-show-ref').disabled = false;
        const list = document.getElementById('essay-ref-list');
        list.innerHTML = '';
        q.ref.forEach(r => {
          const li = document.createElement('li');
          li.textContent = '· ' + r;
          list.appendChild(li);
        });
        Array.from(document.querySelectorAll('.essay-btn')).forEach(b => {
          b.disabled = false;
          b.onclick = () => {
            Array.from(document.querySelectorAll('.essay-btn')).forEach(x => x.disabled = true);
            b.style.borderColor = 'var(--seal)';
            b.style.background = '#f7e6df';
            recordScore(parseInt(b.dataset.score, 10), q);
          };
        });
      }
    }

    // 简答显示参考答案
    document.getElementById('btn-show-ref').addEventListener('click', function(){
      document.getElementById('essay-ref').style.display = 'block';
      document.getElementById('essay-self-eval').style.display = 'block';
      this.disabled = true;
      this.style.display = 'none';
    });

    // ===== 记录分数 =====
    function recordScore(score, q){
      state.answers.push({ score: score, dim: q.d });
      state.dimScore[q.d] += score;
      document.getElementById('fb-score').textContent = '+' + score + ' 分';
      document.getElementById('fb-explain').textContent = q.e;
      document.getElementById('q-feedback').style.display = 'block';
    }

    // ===== 下一题 =====
    document.getElementById('btn-next').addEventListener('click', () => {
      state.idx++;
      if (state.idx >= 30) {
        showResult();
      } else {
        renderQuestion();
      }
    });

    // ===== 展示结果 =====
    function showResult(){
      document.getElementById('test-quiz').style.display = 'none';
      document.getElementById('test-result').style.display = 'block';
      const total = state.answers.reduce((s, a) => s + a.score, 0);
      const level = LEVELS[state.role].find(l => total >= l.min);
      document.getElementById('res-score').textContent = total;
      document.getElementById('res-level').textContent = level.name;
      document.getElementById('res-comment').textContent = genComment(total, level, state.role, state.dimScore, state.dimMax);
      document.getElementById('radar-wrap').innerHTML = renderRadar(state.dimScore, state.dimMax, level.color);
      document.getElementById('certificate-wrap').innerHTML = renderCert(total, level, state.role, state.dimScore, state.dimMax);
      (function(){ var p=document.getElementById('ability-test'); if(p&&p.classList.contains('open')) p.scrollTo({top:0,behavior:'smooth'}); })();
    }

    // ===== 雷达图 =====
    function renderRadar(scores, maxes, color){
      const dims = Object.keys(scores);
      const size = 260, cx = 130, cy = 130, r = 85;
      const angleStep = 2 * Math.PI / dims.length;
      const start = -Math.PI / 2;
      let bg = '', axis = '', dataPts = [], labels = '';
      [0.25, 0.5, 0.75, 1].forEach(t => {
        const pts = dims.map((_, i) => {
          const a = start + i * angleStep;
          return (cx + Math.cos(a) * r * t).toFixed(1) + ',' + (cy + Math.sin(a) * r * t).toFixed(1);
        }).join(' ');
        bg += '<polygon points="' + pts + '" fill="none" stroke="#ddd" stroke-width="0.5"/>';
      });
      dims.forEach((_, i) => {
        const a = start + i * angleStep;
        axis += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(a) * r).toFixed(1) + '" y2="' + (cy + Math.sin(a) * r).toFixed(1) + '" stroke="#ddd" stroke-width="0.5"/>';
      });
      dims.forEach((d, i) => {
        const t = scores[d] / maxes[d];
        const a = start + i * angleStep;
        dataPts.push((cx + Math.cos(a) * r * t).toFixed(1) + ',' + (cy + Math.sin(a) * r * t).toFixed(1));
      });
      dims.forEach((d, i) => {
        const a = start + i * angleStep;
        const lx = cx + Math.cos(a) * (r + 22);
        const ly = cy + Math.sin(a) * (r + 22);
        let anchor = 'middle';
        if (Math.cos(a) > 0.2) anchor = 'start';
        else if (Math.cos(a) < -0.2) anchor = 'end';
        labels += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + anchor + '" dominant-baseline="middle" font-size="11" fill="#333">' + d + '</text>';
        labels += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 13).toFixed(1) + '" text-anchor="' + anchor + '" dominant-baseline="middle" font-size="10" fill="' + color + '" font-weight="bold">' + scores[d] + '/' + maxes[d] + '</text>';
      });
      return '<svg viewBox="0 0 260 260">' + bg + axis + '<polygon points="' + dataPts.join(' ') + '" fill="' + color + '" fill-opacity="0.22" stroke="' + color + '" stroke-width="1.5"/>' + labels + '</svg>';
    }

    // ===== 证书 =====
    function renderCert(total, level, role, scores, maxes){
      const W = 750, H = 1000;
      const roleLabel = role === 'parent' ? '围棋家长认证' : '围棋教师认证';
      const roleLabelEn = role === 'parent' ? 'PARENT CERTIFICATE' : 'TEACHER CERTIFICATE';
      const d = new Date();
      const dateStr = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
      const serial = 'LBG-' + (role === 'parent' ? 'P' : 'T') + '-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      const dims = Object.keys(scores);
      let barSvg = '';
      const barY0 = 600, barGap = 50;
      dims.forEach((d, i) => {
        const y = barY0 + i * barGap;
        const pct = scores[d] / maxes[d];
        barSvg += '<text x="180" y="' + y + '" font-size="18" fill="#1a1a1a" font-family="serif">' + d + '</text>';
        barSvg += '<text x="570" y="' + y + '" text-anchor="end" font-size="15" fill="#666" font-family="serif">' + scores[d] + ' / ' + maxes[d] + '</text>';
        barSvg += '<rect x="180" y="' + (y + 8) + '" width="390" height="6" fill="#eee" rx="3"/>';
        barSvg += '<rect x="180" y="' + (y + 8) + '" width="' + (390 * pct).toFixed(1) + '" height="6" fill="' + level.color + '" rx="3"/>';
      });

      // ===== 装饰性花纹（顶部竹叶 / 底部云纹） =====
      const topOrnament =
        '<g opacity="0.55">' +
        '<path d="M 90,90 Q 130,60 175,90 M 130,75 L 130,105" stroke="#a8362a" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '<path d="M 660,90 Q 620,60 575,90 M 620,75 L 620,105" stroke="#a8362a" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '</g>';
      const cornerOrnaments =
        '<g stroke="#a8362a" stroke-width="1" fill="none" opacity="0.7">' +
        // 左上
        '<path d="M 70,90 L 70,70 L 90,70"/><circle cx="70" cy="70" r="3" fill="#a8362a"/>' +
        // 右上
        '<path d="M 680,90 L 680,70 L 660,70"/><circle cx="680" cy="70" r="3" fill="#a8362a"/>' +
        // 左下
        '<path d="M 70,910 L 70,930 L 90,930"/><circle cx="70" cy="930" r="3" fill="#a8362a"/>' +
        // 右下
        '<path d="M 680,910 L 680,930 L 660,930"/><circle cx="680" cy="930" r="3" fill="#a8362a"/>' +
        '</g>';

      // 底纹水印："棋"字大字置于中央淡淡叠加
      const watermark =
        '<text x="375" y="560" text-anchor="middle" font-family="serif" font-size="360" fill="#a8362a" opacity="0.03" font-weight="bold">棋</text>';

      // ===== 印章（大 / 印泥感 / 环形文字 / 压在日期上）=====
      // 位置：签发日期 (570, 908)，印章中心放在 (555, 895) 略偏左盖住日期
      const stampR = 62;
      const stamp =
        '<defs>' +
          // 环形文字路径（顶部起，顺时针一圈）
          '<path id="stamp-path" d="M 0,-48 A 48,48 0 1,1 -0.01,-48" fill="none"/>' +
          // 印泥不均匀纹理
          '<filter id="ink-tex" x="-20%" y="-20%" width="140%" height="140%">' +
            '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise"/>' +
            '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.1" result="alpha"/>' +
            '<feComposite in="SourceGraphic" in2="alpha" operator="in"/>' +
          '</filter>' +
        '</defs>' +
        '<g transform="translate(555, 895) rotate(-6)" opacity="0.88">' +
          // 主印色圆（带纹理滤镜制造印泥感）
          '<circle cx="0" cy="0" r="' + stampR + '" fill="#c02818" filter="url(#ink-tex)"/>' +
          // 副印色叠层（增加深浅层次）
          '<circle cx="-3" cy="2" r="' + (stampR - 2) + '" fill="#a01810" opacity="0.35" filter="url(#ink-tex)"/>' +
          // 外圈白边（模拟印章边缘留白）
          '<circle cx="0" cy="0" r="' + (stampR - 4) + '" fill="none" stroke="#f8f5ef" stroke-width="2.5"/>' +
          // 内环细线
          '<circle cx="0" cy="0" r="' + (stampR - 22) + '" fill="none" stroke="#f8f5ef" stroke-width="0.8"/>' +
          // 环形文字：萝卜干聊围棋教育（8字均匀分布）
          '<text fill="#f8f5ef" font-size="12.5" font-family="\'Noto Serif SC\', serif" font-weight="900" letter-spacing="18">' +
            '<textPath href="#stamp-path" startOffset="6.25%">萝卜干聊围棋教育</textPath>' +
          '</text>' +
          // 中心五角星（传统印章元素）
          '<path d="M 0,-15 L 4.4,-4.6 15.5,-4.6 6.6,2 10,12.6 0,6 -10,12.6 -6.6,2 -15.5,-4.6 -4.4,-4.6 Z" fill="#f8f5ef"/>' +
          // 中心横杠装饰
          '<line x1="-22" y1="20" x2="22" y2="20" stroke="#f8f5ef" stroke-width="1"/>' +
        '</g>';

      return '<svg viewBox="0 0 750 1000" xmlns="http://www.w3.org/2000/svg" id="cert-svg" width="600">' +
        // 底色
        '<rect width="750" height="1000" fill="#f8f5ef"/>' +
        // 水印
        watermark +
        // 外双框（外粗内细）
        '<rect x="35" y="35" width="680" height="930" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>' +
        '<rect x="48" y="48" width="654" height="904" fill="none" stroke="#a8362a" stroke-width="0.6"/>' +
        // 内层细虚线装饰框
        '<rect x="62" y="62" width="626" height="876" fill="none" stroke="#a8362a" stroke-width="0.4" stroke-dasharray="2,4" opacity="0.6"/>' +
        // 顶部两侧竹叶装饰
        topOrnament +
        // 四角装饰
        cornerOrnaments +
        // 主标题
        '<text x="375" y="165" text-anchor="middle" font-family="\'Noto Serif SC\', serif" font-size="44" fill="#1a1a1a" font-weight="900" letter-spacing="6">' + roleLabel + '</text>' +
        '<text x="375" y="197" text-anchor="middle" font-family="serif" font-size="13" fill="#8a7a5c" letter-spacing="6">' + roleLabelEn + '</text>' +
        // 标题下装饰分隔（三段线 + 中心菱形）
        '<line x1="250" y1="220" x2="345" y2="220" stroke="#a8362a" stroke-width="0.8"/>' +
        '<line x1="405" y1="220" x2="500" y2="220" stroke="#a8362a" stroke-width="0.8"/>' +
        '<path d="M 375,213 L 383,220 L 375,227 L 367,220 Z" fill="#a8362a"/>' +
        // 段位名（主秀区）
        '<text x="375" y="335" text-anchor="middle" font-family="\'Noto Serif SC\', serif" font-size="76" font-weight="900" fill="' + level.color + '" letter-spacing="4">' + level.name + '</text>' +
        // 段位英文小注
        '<text x="375" y="410" text-anchor="middle" font-size="14" fill="#8a7a5c" letter-spacing="10">— 段 位 认 证 —</text>' +
        // 分数
        '<text x="375" y="495" text-anchor="middle" font-family="serif" font-size="32" fill="#1a1a1a">总得分  <tspan font-weight="bold" fill="' + level.color + '">' + total + '</tspan>  /  150</text>' +
        // 四维度评价标题
        '<text x="375" y="562" text-anchor="middle" font-size="13" fill="#8a7a5c" letter-spacing="6">四 维 度 评 价</text>' +
        '<line x1="290" y1="575" x2="460" y2="575" stroke="#a8362a" stroke-width="0.4" opacity="0.5"/>' +
        // 四维度进度条
        barSvg +
        // 底部横向装饰分割
        '<line x1="100" y1="838" x2="650" y2="838" stroke="#a8362a" stroke-width="0.4" opacity="0.5"/>' +
        '<circle cx="375" cy="838" r="2.5" fill="#a8362a"/>' +
        // 左侧：签发人
        '<text x="180" y="880" font-family="serif" font-size="13" fill="#8a7a5c" letter-spacing="2">签发人</text>' +
        '<text x="180" y="912" font-family="\'Noto Serif SC\', serif" font-size="24" font-weight="900" fill="#1a1a1a">萝卜干</text>' +
        '<text x="180" y="932" font-size="11" fill="#666">围棋教育从业者 · 多年教龄</text>' +
        // 右侧：签发日期（印章会盖在此处）
        '<text x="570" y="880" text-anchor="end" font-family="serif" font-size="13" fill="#8a7a5c" letter-spacing="2">签发日期</text>' +
        '<text x="570" y="912" text-anchor="end" font-family="\'Noto Serif SC\', serif" font-size="24" font-weight="900" fill="#1a1a1a">' + dateStr + '</text>' +
        '<text x="570" y="932" text-anchor="end" font-size="11" fill="#666">' + serial + '</text>' +
        // 印章（盖在日期上）
        stamp +
        // 免责小字
        '<text x="375" y="978" text-anchor="middle" font-size="9" fill="#999">本证书为教育认知度评估结果 · 不代表围棋段位鉴定 · weiqiluobogan.com · 微信 yxwq0909</text>' +
        '</svg>';
    }

    // ===== 个性化点评 =====
    function genComment(total, level, role, scores, maxes){
      const dims = Object.keys(scores);
      const pcts = dims.map(d => ({ d: d, pct: scores[d] / maxes[d] }));
      pcts.sort((a, b) => b.pct - a.pct);
      const best = pcts[0].d;
      const worst = pcts[pcts.length - 1].d;
      const bank = {
        parent: {
          '走进围棋的家长': '你在四个维度都到了很高水平，特别是【' + best + '】——已经不只是"支持孩子学围棋"，而是真正走进了围棋教育本身。像你这样思考的家长非常少见。如果说还能再往上走，是【' + worst + '】方向，教育是长期工程，视野可以持续拓宽。',
          '教育型家长': '你已经超越了大部分家长的段位，特别是【' + best + '】显示出你有系统的教育视角。可以再往【' + worst + '】方向精进 —— 你会发现围棋家长这条路很值得深入走。',
          '清醒家长': '你对孩子学棋这件事有自己的判断，不容易被"考级焦虑"带跑。【' + best + '】是你的底子，【' + worst + '】是下一个成长空间。继续保持这份清醒，会走得很远。',
          '用心家长': '你已经比普通家长走前面了，愿意主动学习、愿意反思。【' + best + '】是你已经想清楚的，【' + worst + '】还有空间。多陪伴、多观察，不用急。',
          '起步家长': '刚起步很正常，围棋家长这条路的确需要慢慢来。你现在【' + best + '】稍好一些，【' + worst + '】可以先从这里补起。别被别的家长的"高标准动作"吓到，扎实走就够了。'
        },
        teacher: {
          '老师中的老师': '你在四个维度都达到了很高水平，特别是【' + best + '】——这已经不是"教围棋"的水平，是"教教育"的水平。【' + worst + '】相对稍弱，但整体也在高段位。你身上有那种老前辈才有的分寸感。',
          '家长口中的好老师': '你不仅会教棋，还懂家长、懂孩子、懂教育的边界。【' + best + '】是你的招牌，【' + worst + '】是你可以再打磨的方向。你现在的段位已经能让家长主动推荐你。',
          '匠人教师': '扎实、认真、有自己的一套。【' + best + '】做得很好，【' + worst + '】可以再精进 —— 匠人到名师的距离，通常就差这一层。',
          '合格教师': '基本功过关，能独立带课。【' + best + '】是你的相对优势，【' + worst + '】需要继续打磨。围棋教师这条路，你走上来了，接下来看你愿不愿意多深入一步。',
          '新手教师': '你是新入行，这个阶段最重要的是"不着急定型"。【' + best + '】的意识不错，【' + worst + '】需要多补课 —— 建议多看看老教师怎么处理家长、怎么处理不同性格孩子。'
        }
      };
      return bank[role][level.name];
    }

    // ===== 下载证书 =====
    document.getElementById('btn-download').addEventListener('click', function(){
      const svg = document.getElementById('cert-svg');
      if (!svg) return;
      const str = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const scale = 2;
        const cvs = document.createElement('canvas');
        cvs.width = 750 * scale;
        cvs.height = 1000 * scale;
        const ctx = cvs.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const lvName = document.getElementById('res-level').textContent;
        window.__luoboShareImage(cvs, '萝卜干围棋认证-' + lvName + '.png');
      };
      img.onerror = () => { if(window.showToast) window.showToast('证书生成失败，请刷新重试'); URL.revokeObjectURL(url); };
      img.src = url;
    });

    // ===== 重做本版 =====
    document.getElementById('btn-retry').addEventListener('click', () => {
      document.getElementById('test-result').style.display = 'none';
      document.getElementById('test-intro').style.display = 'block';
      document.getElementById('test-selector').style.display = 'flex';
      (function(){ var p=document.getElementById('ability-test'); if(p&&p.classList.contains('open')) p.scrollTo({top:0,behavior:'smooth'}); })();
    });

    // ===== 换另一版 =====
    document.getElementById('btn-switch').addEventListener('click', () => {
      const other = state.role === 'parent' ? 'teacher' : 'parent';
      document.querySelectorAll('.test-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.role === other));
      state.role = other;
      document.getElementById('intro-title').textContent = INTROS[other].title;
      document.getElementById('intro-desc').innerHTML = INTROS[other].desc;
      document.getElementById('test-result').style.display = 'none';
      document.getElementById('test-intro').style.display = 'block';
      document.getElementById('test-selector').style.display = 'flex';
      (function(){ var p=document.getElementById('ability-test'); if(p&&p.classList.contains('open')) p.scrollTo({top:0,behavior:'smooth'}); })();
    });
  })();
