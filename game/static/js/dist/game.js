class Menu{constructor(t){this.root=t,this.$menu=$('\n        <div class="game-menu">\n            <div class="game-menu-box">\n                <div class="game-menu-box-item game-menu-box-item-sing_mode">\n                    单人模式\n                </div>\n                <br>\n                <div class="game-menu-box-item game-menu-box-item-multi_mode">\n                    多人模式\n                </div>\n                <br>\n                <div class="game-menu-box-item game-menu-box-item-settings">\n                    退出\n                </div>\n            </div>\n        </div>\n        '),this.hide(),this.root.$game.append(this.$menu),this.$sing_mode=this.$menu.find(".game-menu-box-item-sing_mode"),this.$multi_mode=this.$menu.find(".game-menu-box-item-multi_mode"),this.$settings=this.$menu.find(".game-menu-box-item-settings"),this.start()}start(){this.add_listening_events()}add_listening_events(){let t=this;this.$sing_mode.click((function(){t.hide(),t.root.playground.show("sing_mode")})),this.$multi_mode.click((function(){t.hide(),t.root.playground.show("multi_mode")})),this.$settings.click((function(){t.root.settings.logout_on_remote()}))}show(){this.$menu.show()}hide(){this.$menu.hide()}}let last_timestamp,GAME_OBJECTS=[];class GameObject{constructor(){GAME_OBJECTS.push(this),this.has_init=!1,this.time_diff=0,this.id=this.create_id()}create_id(){let t="";for(let s=0;s<8;s++){t+=parseInt(Math.floor(10*Math.random()))}return t}start(){}update(){}late_update(){}render(){}on_destroy(){}destroy(){this.on_destroy();for(let t=0;t<GAME_OBJECTS.length;t++)if(GAME_OBJECTS[t]===this){GAME_OBJECTS.splice(t,1);break}}}let GAME_ANIMATION=function(t){for(let s=0;s<GAME_OBJECTS.length;s++){let i=GAME_OBJECTS[s];i.has_init?(i.time_diff=t-last_timestamp,i.update()):(i.start(),i.has_init=!0)}for(let t=0;t<GAME_OBJECTS.length;t++){GAME_OBJECTS[t].late_update()}last_timestamp=t,requestAnimationFrame(GAME_ANIMATION)};requestAnimationFrame(GAME_ANIMATION);class GameMap extends GameObject{constructor(t){super(),this.playground=t,this.$canvas=$("<canvas tabindex=0></canvas>"),this.context=this.$canvas[0].getContext("2d"),this.context.canvas.height=this.playground.height,this.context.canvas.width=this.playground.width,this.playground.$playground.append(this.$canvas)}start(){this.$canvas.focus()}resize(){this.context.canvas.height=this.playground.height,this.context.canvas.width=this.playground.width,this.context.fillStyle="rgba(0, 0, 0, 1)",this.context.fillRect(0,0,this.context.canvas.width,this.context.canvas.height,.2*this.height,!0)}update(){this.render()}render(){this.context.fillStyle="rgba(0, 0, 0, 0.2)",this.context.fillRect(0,0,this.context.canvas.width,this.context.canvas.height,.2*this.height,!0)}}class GamePlayer extends GameObject{constructor(t,s,i,e,a,h,n,o,r){super(),this.playground=t,this.context=this.playground.map.context,this.x=s,this.y=i,this.radius=e,this.color=a,this.speed=h,this.character=n,this.username=o,this.photo=r,this.move_dist=0,this.vx=0,this.vy=0,this.eps=.01,this.holding_skill=null,this.fireballs=[],this.damage_vx=0,this.damage_vy=0,this.damage_speed=0,this.friction=.9,this.protection_time=0,"robot"!==this.character&&(this.img=new Image,this.img.src=this.photo),"me"===this.character&&(this.fireball_coldtime=3,this.fireball_img=new Image,this.fireball_img.src="https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png",this.flash_coldtime=6,this.flash_img=new Image,this.flash_img.src="https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png")}start(){if(this.playground.player_count++,this.playground.notice_board.write(this.playground.player_count+" 人已加入"),this.playground.player_count>=3&&(this.playground.state="fighting",this.playground.notice_board.write("Fighting")),"me"===this.character)this.add_listening_events();else if("robot"===this.character){let t=Math.random()*this.playground.width/this.playground.scale,s=Math.random()*this.playground.height/this.playground.scale;this.move_to(t,s)}}add_listening_events(){let t=this;this.playground.map.$canvas.mousedown((function(s){if("fighting"!==t.playground.state)return!0;const i=t.context.canvas.getBoundingClientRect();if(3===s.which){let e=(s.clientX-i.left)/t.playground.scale,a=(s.clientY-i.top)/t.playground.scale;t.move_to(e,a),"multi_mode"===t.playground.mode&&t.playground.socket.send_move_to(e,a)}else if(1===s.which){let e=(s.clientX-i.left)/t.playground.scale,a=(s.clientY-i.top)/t.playground.scale;if("fireball"===t.holding_skill){if(t.fireball_coldtime>t.eps)return!1;let s=t.shoot_fireball(e,a);"multi_mode"===t.playground.mode&&t.playground.socket.send_shoot_fireball(e,a,s.id)}else if("flash"===t.holding_skill){if(t.flash_coldtime>t.eps)return!1;t.flash(e,a),"multi_mode"===t.playground.mode&&t.playground.socket.send_flash(e,a)}t.holding_skill=null}})),this.playground.map.$canvas.keydown((function(s){if(13===s.which){if("multi_mode"===t.playground.mode)return t.playground.chatbox.show_input(),!1}else if(27===s.which&&"multi_mode"===t.playground.mode)return t.playground.chatbox.hide_input(),!1;return"fighting"!==t.playground.state||(81===s.which?t.fireball_coldtime>t.eps||(t.holding_skill="fireball",!1):70===s.which?t.flash_coldtime>t.eps||(t.holding_skill="flash",!1):void 0)}))}move_to(t,s){this.move_dist=this.get_dist(this.x,this.y,t,s);let i=Math.atan2(s-this.y,t-this.x);this.vx=Math.cos(i),this.vy=Math.sin(i)}get_dist(t,s,i,e){let a=t-i,h=s-e;return Math.sqrt(a*a+h*h)}shoot_fireball(t,s){let i=this.x,e=this.y,a=Math.atan2(s-this.y,t-this.x),h=Math.cos(a),n=Math.sin(a),o=new FireBall(this.playground,this,i,e,.01,"orange",.6,1,h,n,.01);return this.fireballs.push(o),this.fireball_coldtime=3,o}destroy_fireball(t){for(let s=0;s<this.fireballs.length;s++){let i=this.fireballs[s];if(i.uuid===t){i.destroy();break}}}flash(t,s){let i=this.get_dist(this.x,this.y,t,s);i=Math.min(i,.8);let e=Math.atan2(s-this.y,t-this.x);this.x+=i*Math.cos(e),this.y+=i*Math.sin(e),this.flash_coldtime=6,this.move_dist=0}update(){this.protection_time+=this.time_diff/1e3,this.update_win(),"me"===this.character&&"fighting"===this.playground.state&&this.update_coldtime(),this.update_move(),this.render()}update_win(){"fighting"===this.playground.state&&"me"===this.character&&1===this.playground.players.length&&(this.playground.state="gameover",this.playground.score_board.win())}update_coldtime(){this.fireball_coldtime-=this.time_diff/1e3,this.fireball_coldtime=Math.max(this.fireball_coldtime,0),this.flash_coldtime-=this.time_diff/1e3,this.flash_coldtime=Math.max(this.flash_coldtime,0)}update_move(){if("robot"===this.character&&this.protection_time>4&&Math.random()<1/300){let t=this.playground.players[Math.floor(Math.random()*this.playground.players.length)],s=t.x+t.vx*t.speed*t.time_diff/1e3*1,i=t.y+t.vy*t.speed*t.time_diff/1e3*1;this.shoot_fireball(s,i)}if(this.damage_speed>this.eps)this.vx=this.vy=this.move_dist=0,this.x+=this.damage_vx*this.damage_speed*this.time_diff/1e3,this.y+=this.damage_vy*this.damage_speed*this.time_diff/1e3,this.damage_speed*=this.friction;else if(this.move_dist<this.eps){if(this.move_dist=0,this.vx=0,this.vy=0,"robot"===this.character){let t=Math.random()*this.playground.width/this.playground.scale,s=Math.random()*this.playground.height/this.playground.scale;this.move_to(t,s)}}else{let t=Math.min(this.speed*this.time_diff/1e3,this.move_dist);this.x+=this.vx*t,this.y+=this.vy*t,this.move_dist-=t}}is_attacked(t,s){let i=20+10*Math.random();for(let t=0;t<i;t++){let t=this.x,s=this.y,i=.1*this.radius*Math.random(),e=this.color,a=10*this.speed,h=5*this.radius*Math.random(),n=2*Math.PI*Math.random(),o=Math.cos(n),r=Math.sin(n);new Particle(this.playground,t,s,i,e,a,h,o,r)}if(this.radius-=s,this.radius<this.eps)return this.destroy(),!1;this.damage_vx=Math.cos(t),this.damage_vy=Math.sin(t),this.damage_speed=75*s,this.speed*=.8}receive_is_attacked(t,s,i,e,a,h){h.destroy_fireball(a),this.x=t,this.y=s,this.is_attacked(i,e)}render(){let t=this.playground.scale;"robot"!==this.character?(this.context.save(),this.context.beginPath(),this.context.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.context.stroke(),this.context.clip(),this.context.drawImage(this.img,(this.x-this.radius)*t,(this.y-this.radius)*t,2*this.radius*t,2*this.radius*t),this.context.restore()):(this.context.beginPath(),this.context.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.context.fillStyle=this.color,this.context.fill()),"me"===this.character&&"fighting"===this.playground.state&&(this.render_fireball_img(),this.render_flash_img())}render_fireball_img(){let t=1.5,s=.9,i=.04,e=this.playground.scale;this.context.save(),this.context.beginPath(),this.context.arc(t*e,s*e,i*e,0,2*Math.PI,!1),this.context.stroke(),this.context.clip(),this.context.drawImage(this.fireball_img,1.46*e,.86*e,.08*e,.08*e),this.context.restore(),this.context.beginPath(),this.context.moveTo(t*e,s*e),this.context.arc(t*e,s*e,i*e,0-Math.PI/2,2*Math.PI*this.fireball_coldtime/3-Math.PI/2,!1),this.context.moveTo(t*e,s*e),this.context.fillStyle="rgba(0, 0, 255, 0.5)",this.context.fill()}render_flash_img(){let t=1.62,s=.9,i=.04,e=this.playground.scale;this.context.save(),this.context.beginPath(),this.context.arc(t*e,s*e,i*e,0,2*Math.PI,!1),this.context.stroke(),this.context.clip(),this.context.drawImage(this.flash_img,1.58*e,.86*e,.08*e,.08*e),this.context.restore(),this.context.beginPath(),this.context.moveTo(t*e,s*e),this.context.arc(t*e,s*e,i*e,0-Math.PI/2,2*Math.PI*this.flash_coldtime/6-Math.PI/2,!1),this.context.moveTo(t*e,s*e),this.context.fillStyle="rgba(0, 0, 255, 0.5)",this.context.fill()}on_destroy(){"fighting"===this.playground.state&&"me"===this.character&&(this.playground.state="gameover",this.playground.score_board.lose());for(let t=0;t<this.playground.players.length;t++)if(this.playground.players[t]===this){this.playground.players.splice(t,1);break}}}class ChatBox{constructor(t){this.playground=t,this.$history=$('<div class="game-chat-box-history"></div>'),this.$input=$('<input type="text" class="game-chat-box-input"></input>'),this.$history.hide(),this.$input.hide(),this.playground.$playground.append(this.$history),this.playground.$playground.append(this.$input),this.func_id=null,this.start()}start(){this.add_listening_events()}add_listening_events(){let t=this;this.$input.keydown((function(s){if(27===s.which)return t.hide_input(),!1;if(13===s.which){let s=t.playground.root.settings.username,i=t.$input.val();return i&&(t.$input.val(""),t.add_message(s,i),t.playground.socket.send_message(s,i)),!1}}))}show_history(){this.$history.fadeIn(),this.func_id&&clearTimeout(this.func_id);let t=this;this.func_id=setTimeout((function(){t.$history.fadeOut(),this.func_id=null}),3e3)}render_message(t){return $(`<div>${t}</div>`)}add_message(t,s){this.show_history();let i=`[${t}] ${s}`;this.$history.append(this.render_message(i)),this.$history.scrollTop(this.$history[0].scrollHeight)}show_input(){this.show_history(),this.$input.show(),this.$input.focus()}hide_input(){this.$input.hide(),this.playground.map.$canvas.focus()}}class FireBall extends GameObject{constructor(t,s,i,e,a,h,n,o,r,l,d){super(),this.playground=t,this.context=this.playground.map.context,this.player=s,this.x=i,this.y=e,this.radius=a,this.color=h,this.speed=n,this.move_dist=o,this.vx=r,this.vy=l,this.damage=d,this.eps=.01}start(){}update(){if(this.move_dist<this.eps)return this.destroy(),!1;this.update_move(),"enemy"!==this.player.character&&this.update_attack(),this.render()}update_move(){let t=Math.min(this.speed*this.time_diff/1e3,this.move_dist);this.x+=this.vx*t,this.y+=this.vy*t,this.move_dist-=t}update_attack(){for(let t=0;t<this.playground.players.length;t++){let s=this.playground.players[t];s!==this.player&&this.is_collision(s)&&this.attack(s)}}get_dist(t,s,i,e){let a=t-i,h=s-e;return Math.sqrt(a*a+h*h)}is_collision(t){return this.get_dist(this.x,this.y,t.x,t.y)<this.radius+t.radius}attack(t){let s=Math.atan2(t.y-this.y,t.x-this.x);t.is_attacked(s,this.damage),"multi_mode"===this.playground.mode&&this.playground.socket.send_attack(t.id,t.x,t.y,s,this.damage,this.id),this.destroy()}render(){let t=this.playground.scale;this.context.beginPath(),this.context.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.context.fillStyle=this.color,this.context.fill()}on_destroy(){let t=this.player.fireballs;for(let s=0;s<t.length;s++)if(t[s]===this){t.splice(s,1);break}}}class Particle extends GameObject{constructor(t,s,i,e,a,h,n,o,r){super(),this.playground=t,this.context=this.playground.map.context,this.x=s,this.y=i,this.radius=e,this.color=a,this.speed=h,this.move_dist=n,this.vx=o,this.vy=r,this.friction=.9,this.eps=.01}start(){}update(){if(this.speed<this.eps||this.move_dist<this.eps)return this.destroy(),!1;let t=Math.min(this.speed*this.time_diff/1e3,this.move_dist);this.x+=this.vx*t,this.y+=this.vy*t,this.move_dist-=t,this.speed*=this.friction,this.render()}render(){let t=this.playground.scale;this.context.beginPath(),this.context.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.context.fillStyle=this.color,this.context.fill()}}class NoticeBoard extends GameObject{constructor(t){super(),this.playground=t,this.context=this.playground.map.context,this.text="0 人已加入"}start(){}write(t){this.text=t}update(){this.render()}render(){this.context.font="20px serif",this.context.fillStyle="white",this.context.textAlign="center",this.context.fillText(this.text,this.playground.width/2,20)}}class ScoreBoard extends GameObject{constructor(t){super(),this.playground=t,this.context=this.playground.map.context,this.state=null,this.win_img=new Image,this.win_img.src="https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png",this.lose_img=new Image,this.lose_img.src="https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png",this.start()}start(){}add_listening_events(){let t=this;this.playground.map.$canvas.on("click",(function(){t.playground.hide(),t.playground.root.menu.show()}))}win(){this.state="win";let t=this;setTimeout((function(){t.add_listening_events()}),1e3)}lose(){this.state="lose";let t=this;setTimeout((function(){t.add_listening_events()}),1e3)}late_update(){this.render()}render(){let t=this.playground.height/2;"win"===this.state?this.context.drawImage(this.win_img,this.playground.width/2-t/2,this.playground.height/2-t/2,t,t):"lose"===this.state&&this.context.drawImage(this.lose_img,this.playground.width/2-t/2,this.playground.height/2-t/2,t,t)}}class MultiPlayerSocket{constructor(t){this.playground=t,this.ws=new WebSocket("wss://app6621.acapp.acwing.com.cn/wss/multi_mode/?token="+t.root.access),this.start()}start(){this.receive()}receive(){let t=this;this.ws.onmessage=function(s){let i=JSON.parse(s.data),e=i.uuid;if(e===t.uuid)return!1;let a=i.event;"create_player"===a?t.receive_create_player(e,i.username,i.photo):"move_to"===a?t.receive_move_to(e,i.tx,i.ty):"shoot_fireball"===a?t.receive_shoot_fireball(e,i.tx,i.ty,i.fireball_uuid):"attack"===a?t.receive_attack(e,i.victim_uuid,i.x,i.y,i.angle,i.damage,i.fireball_uuid):"flash"===a?t.receive_flash(e,i.tx,i.ty):"message"===a&&t.receive_message(e,i.username,i.text)}}get_player(t){let s=this.playground.players;for(let i=0;i<s.length;i++){let e=s[i];if(e.id===t)return e}return null}send_create_player(t,s){this.ws.send(JSON.stringify({event:"create_player",uuid:this.uuid,username:t,photo:s}))}receive_create_player(t,s,i){let e=new GamePlayer(this.playground,this.playground.width/2/this.playground.scale,.5,.05,"white",.2,"enemy",s,i);e.id=t,this.playground.players.push(e)}send_move_to(t,s){this.ws.send(JSON.stringify({event:"move_to",uuid:this.uuid,tx:t,ty:s}))}receive_move_to(t,s,i){let e=this.get_player(t);e&&e.move_to(s,i)}send_shoot_fireball(t,s,i){this.ws.send(JSON.stringify({event:"shoot_fireball",uuid:this.uuid,tx:t,ty:s,fireball_uuid:i}))}receive_shoot_fireball(t,s,i,e){let a=this.get_player(t);if(a){a.shoot_fireball(s,i).uuid=e}}send_attack(t,s,i,e,a,h){this.ws.send(JSON.stringify({event:"attack",uuid:this.uuid,victim_uuid:t,x:s,y:i,angle:e,damage:a,fireball_uuid:h}))}receive_attack(t,s,i,e,a,h,n){let o=this.get_player(t),r=this.get_player(s);o&&r&&r.receive_is_attacked(i,e,a,h,n,o)}send_flash(t,s){this.ws.send(JSON.stringify({event:"flash",uuid:this.uuid,tx:t,ty:s}))}receive_flash(t,s,i){let e=this.get_player(t);e&&e.flash(s,i)}send_message(t,s){this.ws.send(JSON.stringify({event:"message",uuid:this.uuid,username:t,text:s}))}receive_message(t,s,i){this.playground.chatbox.add_message(s,i)}}class Playground{constructor(t){this.root=t,this.$playground=$('\n        <div class="game-playground">\n        </div>\n        '),this.root.$game.append(this.$playground),this.hide(),this.start()}create_id(){let t="";for(let s=0;s<8;s++){t+=parseInt(Math.floor(10*Math.random()))}return t}start(){let t=this,s=this.create_id();$(window).on(`resize.${s}`,(function(){t.resize()})),this.root.acos&&this.root.acos.api.window.on_close((function(){$(window).off(`resize.${s}`)}))}resize(){this.height=this.$playground.height(),this.width=this.$playground.width();let t=Math.min(this.width/16,this.height/9);this.height=9*t,this.width=16*t,this.scale=this.height,this.map&&this.map.resize()}show(t){let s=this;if(this.$playground.show(),this.height=this.$playground.height(),this.width=this.$playground.width(),this.map=new GameMap(this),this.mode=t,this.state="waiting",this.player_count=0,this.notice_board=new NoticeBoard(this),this.score_board=new ScoreBoard(this),this.resize(),this.players=[],this.players.push(new GamePlayer(this,this.width/2/this.scale,.5,.05,"white",.2,"me",this.root.settings.username,this.root.settings.photo)),"sing_mode"===t)for(let t=0;t<5;t++)this.players.push(new GamePlayer(this,this.width/2/this.scale,.5,.05,this.get_random_color(),.2,"robot"));else"multi_mode"===t&&(this.chatbox=new ChatBox(this),this.socket=new MultiPlayerSocket(this),this.socket.uuid=this.players[0].id,this.socket.ws.onopen=function(){s.socket.send_create_player(s.root.settings.username,s.root.settings.photo)})}hide(){for(;this.players&&this.players.length>0;)this.players[0].destroy();this.map&&(this.map.destroy(),this.map=null),this.notice_board&&(this.notice_board.destroy(),this.notice_board=null),this.score_board&&(this.score_board.destroy(),this.score_board=null),this.$playground.empty(),this.$playground.hide()}get_random_color(){return["blue","red","pink","yellow","grey","green"][Math.floor(6*Math.random())]}}class Settings{constructor(t){this.root=t,this.platform="web",this.root.acos&&(this.platform="acapp"),this.username="",this.photo="",this.$settings=$('\n        <div class="game-settings">\n            <div class="game-settings-login">\n                <div class="game-settings-title">\n                    登录\n                </div>\n                <div class="game-settings-username">\n                    <div class="game-settings-item">\n                        <input type="text" placeholder="用户名">\n                    </div>\n                </div>\n                <div class="game-settings-password">\n                    <div class="game-settings-item">\n                        <input type="password" placeholder="密码">\n                    </div>\n                </div>\n                <div class="game-settings-submit">\n                    <div class="game-settings-item">\n                        <button>登录</button>\n                    </div>\n                </div>\n                <div class="game-settings-errormessages">\n                </div>\n                <div class="game-settings-option">\n                    注册\n                </div>\n                <br>\n                <div class="game-settings-acwing">\n                    <img src="https://app6621.acapp.acwing.com.cn/static/image/settings/acwing.png" width="40">\n                    <br>\n                    <div>AcWing 一键登录</div>\n                </div>\n            </div>\n\n            <div class="game-settings-register">\n                <div class="game-settings-title">\n                    注册\n                </div>\n                <div class="game-settings-username">\n                    <div class="game-settings-item">\n                        <input type="text" placeholder="用户名">\n                    </div>\n                </div>\n                <div class="game-settings-password game-settings-password-first">\n                    <div class="game-settings-item">\n                        <input type="password" placeholder="密码">\n                    </div>\n                </div>\n                <div class="game-settings-password game-settings-password-second">\n                    <div class="game-settings-item">\n                        <input type="password" placeholder="确认密码">\n                    </div>\n                </div>\n                <div class="game-settings-submit">\n                    <div class="game-settings-item">\n                        <button>注册</button>\n                    </div>\n                </div>\n                <div class="game-settings-errormessages">\n                </div>\n                <div class="game-settings-option">\n                    登录\n                </div>\n                <br>\n                <div class="game-settings-acwing">\n                    <img src="https://app6621.acapp.acwing.com.cn/static/image/settings/acwing.png" width="40">\n                    <br>\n                    <div>AcWing 一键登录</div>\n                </div>\n            </div>\n        </div>\n        '),this.root.$game.append(this.$settings),this.$login=this.$settings.find(".game-settings-login"),this.$login_username=this.$login.find(".game-settings-username input"),this.$login_password=this.$login.find(".game-settings-password input"),this.$login_submit=this.$login.find(".game-settings-submit button"),this.$login_errormessages=this.$login.find(".game-settings-errormessages"),this.$login_register=this.$login.find(".game-settings-option"),this.$register=this.$settings.find(".game-settings-register"),this.$register_username=this.$register.find(".game-settings-username input"),this.$register_password=this.$register.find(".game-settings-password-first input"),this.$register_password_confirm=this.$register.find(".game-settings-password-second input"),this.$register_submit=this.$register.find(".game-settings-submit button"),this.$register_errormessages=this.$register.find(".game-settings-errormessages"),this.$register_login=this.$register.find(".game-settings-option"),this.$acwing_login=this.$settings.find(".game-settings-acwing img"),this.$login.hide(),this.$register.hide(),this.start()}start(){"web"===this.platform?(this.root.access?(this.getinfo_web(),this.refresh_jwt_token()):this.login(),this.add_listening_events()):this.getinfo_acapp()}refresh_jwt_token(){setInterval((()=>{$.ajax({url:"https://app6621.acapp.acwing.com.cn/settings/token/refresh/",type:"POST",data:{refresh:this.root.refresh},success:t=>{this.root.access=t.access}})}),27e4),setTimeout((()=>{$.ajax({url:"https://app6621.acapp.acwing.com.cn/settings/ranklist/",type:"GET",headers:{Authorization:"Bearer "+this.root.access},success:t=>{console.log(t)}})}),5e3)}add_listening_events(){this.add_listening_events_login(),this.add_listening_events_register();let t=this;this.$acwing_login.click((function(){t.acwing_login()}))}add_listening_events_login(){let t=this;this.$login_register.click((function(){t.register()})),this.$login_submit.click((function(){t.login_on_remote()}))}add_listening_events_register(){let t=this;this.$register_login.click((function(){t.login()})),this.$register_submit.click((function(){t.register_on_remote()}))}getinfo_web(){let t=this;$.ajax({url:"https://app6621.acapp.acwing.com.cn/settings/getinfo/",type:"GET",headers:{Authorization:"Bearer "+t.root.access},success:function(s){"success"===s.result?(t.username=s.username,t.photo=s.photo,t.hide(),t.root.menu.show()):t.login()}})}getinfo_acapp(){let t=this;$.ajax({url:"https://app6621.acapp.acwing.com.cn/settings/oauth/acwing_acapp/apply_code/",type:"GET",success:function(s){"success"===s.result&&t.acapp_login(s.appid,s.redirect_uri,s.scope,s.state)}})}acapp_login(t,s,i,e){let a=this;this.root.acos.api.oauth2.authorize(t,s,i,e,(function(t){"success"===t.result&&(a.username=t.username,a.photo=t.photo,a.hide(),a.root.menu.show(),a.root.access=t.access,a.root.refresh=t.refresh,a.refresh_jwt_token())}))}hide(){this.$settings.hide()}show(){this.$settings.show()}login(){this.$register.hide(),this.$login.show()}register(){this.$login.hide(),this.$register.show()}login_on_remote(t,s){t=t||this.$login_username.val(),s=s||this.$login_password.val(),this.$login_errormessages.empty();let i=this;$.ajax({url:"https://app6621.acapp.acwing.com.cn/settings/token/",type:"POST",data:{username:t,password:s},success:function(t){i.root.access=t.access,i.root.refresh=t.refresh,i.refresh_jwt_token(),i.getinfo_web()},error:()=>{i.$login_errormessages.html("用户名或密码不正确")}})}logout_on_remote(){"acapp"===this.platform?this.root.acos.api.window.close():(this.root.access="",this.root.refresh="",location.href="/")}register_on_remote(){let t=this.$register_username.val(),s=this.$register_password.val(),i=this.$register_password_confirm.val();this.$register_errormessages.empty(),$.ajax({url:"https://app6621.acapp.acwing.com.cn/settings/register/",type:"POST",data:{username:t,password:s,password_confirm:i},success:i=>{"success"===i.result?this.login_on_remote(t,s):this.$register_errormessages.html(i.result)}})}acwing_login(){$.ajax({url:"https://app6621.acapp.acwing.com.cn/settings/oauth/acwing_web/apply_code",type:"GET",success:function(t){"success"===t.result&&window.location.replace(t.apply_code_url)}})}}export class Game{constructor(t,s,i,e){this.id=t,this.acos=s,this.access=i,this.refresh=e,this.$game=$("#"+t),this.settings=new Settings(this),this.menu=new Menu(this),this.playground=new Playground(this),s||(document.oncontextmenu=function(){return!1}),this.start()}start(){}}
