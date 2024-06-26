from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from match_system.src.match_server.match_service import Match
from game.models.players.player import Player
from channels.db import database_sync_to_async

class MultiPlayer(AsyncWebsocketConsumer):
        async def connect(self):
                user = self.scope['user']

                # self.room_name = None

                # for i in range(1000):
                #         name = "room-%d" % (i)
                #         if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                #                 self.room_name = name
                #                 break;
                
                # if not self.room_name:
                #         return
                
                if user.is_authenticated:
                        await self.accept()
                else:
                        await self.close()

                # if not cache.has_key(self.room_name):
                #         cache.set(self.room_name, [], 3600) # 有效期：1h

                # for player in cache.get(self.room_name):
                #         await self.send(text_data = json.dumps({
                #                 "event": "create_player",
                #                 "uuid": player["uuid"],
                #                 "username": player["username"],
                #                 "photo": player["photo"]
                #         }))

                # await self.channel_layer.group_add(self.room_name, self.channel_name)

        async def disconnect(self, close_code):
                if hasattr(self, 'room_name') and self.room_name:
                        await self.channel_layer.group_discard(self.room_name, self.channel_name)

        async def receive(self, text_data):
                data = json.loads(text_data)

                event = data["event"]
                if event == "create_player":
                        await self.create_player(data)
                elif event == "move_to":
                        await self.move_to(data)
                elif event == "shoot_fireball":
                        await self.shoot_fireball(data)
                elif event == "attack":
                        await self.attack(data)
                elif event == "flash":
                        await self.flash(data)
                elif event == "message":
                        await self.message(data)

        async def create_player(self, data):
                self.room_name = None
                self.uuid = data["uuid"]

                # Make socket
                transport = TSocket.TSocket('127.0.0.1', 9090)

                # Buffering is critical. Raw sockets are very slow
                transport = TTransport.TBufferedTransport(transport)

                # Wrap in a protocol
                protocol = TBinaryProtocol.TBinaryProtocol(transport)

                # Create a client to use the protocol encoder
                client = Match.Client(protocol)

                def from_db_get_player():
                        return Player.objects.get(user__username = data["username"])
                player = await database_sync_to_async(from_db_get_player)()

                # Connect!
                transport.open()

                client.add_player(player.score, data["uuid"], data["username"], data["photo"], self.channel_name)

                # Close!
                transport.close()

                # players = cache.get(self.room_name)
                # players.append({
                #         "uuid": data["uuid"],
                #         "username": data["username"],
                #         "photo": data["photo"]
                # })
                # cache.set(self.room_name, players, 3600)

                # await self.channel_layer.group_send(self.room_name, {
                #         "type": "group_send_event",
                #         "event": "create_player",
                #         "uuid": data["uuid"],
                #         "username": data["username"],
                #         "photo": data["photo"]
                # })

        async def move_to(self, data):
                await self.channel_layer.group_send(self.room_name, {
                        "type": "group_send_event",
                        "event": "move_to",
                        "uuid": data["uuid"],
                        "tx": data["tx"],
                        "ty": data["ty"]
                })

        async def shoot_fireball(self, data):
                await self.channel_layer.group_send(self.room_name, {
                        "type": "group_send_event",
                        "event": "shoot_fireball",
                        "uuid": data["uuid"],
                        "tx": data["tx"],
                        "ty": data["ty"],
                        "fireball_uuid": data["fireball_uuid"]
                })

        async def attack(self, data):
                if not self.room_name:
                        return
                players = cache.get(self.room_name)

                if not players:
                        return
                for player in players:
                        if player["uuid"] == data["victim_uuid"]:
                                player["hp"] -= 25;
                remain_players_cnt = 0
                for player in players:
                        if player["hp"] > 0:
                                remain_players_cnt += 1

                if remain_players_cnt > 1:
                        if self.room_name:
                                cache.set(self.room_name, players, 3600)
                else:
                        def in_db_update_player_score(username, score):
                                player = Player.objects.get(user__username = username)
                                player.score += score
                                player.save()
                        for player in players:
                                if player["hp"] <= 0:
                                        await database_sync_to_async(in_db_update_player_score)(player["username"], -5)
                                else:
                                        await database_sync_to_async(in_db_update_player_score)(player["username"], 10)

                await self.channel_layer.group_send(self.room_name, {
                        "type": "group_send_event",
                        "event": "attack",
                        "uuid": data["uuid"],
                        "victim_uuid": data["victim_uuid"],
                        "x": data["x"],
                        "y": data["y"],
                        "angle": data["angle"],
                        "damage": data["damage"],
                        "fireball_uuid": data["fireball_uuid"]
                })

        async def flash(self, data):
                await self.channel_layer.group_send(self.room_name, {
                        "type": "group_send_event",
                        "event": "flash",
                        "uuid": data["uuid"],
                        "tx": data["tx"],
                        "ty": data["ty"]
                })

        async def message(self, data):
                await self.channel_layer.group_send(self.room_name, {
                        "type": "group_send_event",
                        "event": "message",
                        "uuid": data["uuid"],
                        "username": data["username"],
                        "text": data["text"]
                })

        async def group_send_event(self, data):
                if not self.room_name:
                        keys = cache.keys("*%s*" % self.uuid)
                        if keys:
                                self.room_name = keys[0]

                await self.send(text_data = json.dumps(data))
