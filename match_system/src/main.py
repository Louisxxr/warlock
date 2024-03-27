#! /usr/bin/env python3

import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])
from match_server.match_service import Match
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer
from queue import Queue
from time import sleep
from threading import Thread

from warlock.asgi import channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache

ROOM_CAPACITY = 3

player_queue = Queue() # 消息队列

class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0 # 等待时间

class MatchRequestHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        player = Player(score, uuid, username, photo, channel_name)
        player_queue.put(player)
        return 0

class PlayerPool:
    def __init__(self):
        self.players = []
    
    def add_player(self, player):
        print("add player: %s %s %d" % (player.uuid, player.username, player.score))
        self.players.append(player)

    def check_match(self, a, b):
        diff = abs(a.score - b.score)
        a_max_diff = a.waiting_time * 50
        b_max_diff = b.waiting_time * 50
        return diff <= a_max_diff and diff <= b_max_diff

    def match_success_func(self, bros):
        print("bros: %s %s %s" % (bros[0].uuid, bros[1].uuid, bros[2].uuid))
        room_name = "room-%s-%s-%s" % (bros[0].uuid, bros[1].uuid, bros[2].uuid)
        players = []
        for bro in bros:
            async_to_sync(channel_layer.group_add)(room_name, bro.channel_name)
            players.append({
                "uuid": bro.uuid,
                "username": bro.username,
                "photo": bro.photo,
                "hp": 100
            })
        cache.set(room_name, players, 3600)
        for bro in bros:
            async_to_sync(channel_layer.group_send)(room_name, {
                "type": "group_send_event",
                "event": "create_player",
                "uuid": bro.uuid,
                "username": bro.username,
                "photo": bro.photo
            })

    def match(self): # 若改变 ROOM_CAPACITY，则以下逻辑不适用
        while len(self.players) >= 3:
            self.players = sorted(self.players, key = lambda p: p.score)
            flag = False
            for i in range(len(self.players) - 2):
                a, b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                if self.check_match(a, b) and self.check_match(b, c) and self.check_match(a, c):
                    flag = True
                    self.match_success_func([a, b, c])
                    self.players = self.players[:i] + self.players[i + 3:]
                    break
            if not flag:
                break

        self.increase_waiting_time()

    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

def get_player_from_queue():
    try:
        return player_queue.get_nowait()
    except:
        return None

def Worker(): # 线程
    player_pool = PlayerPool()
    while True:
        player = get_player_from_queue()
        if (player):
            player_pool.add_player(player)
        else:
            player_pool.match()
            sleep(1)


if __name__ == '__main__':
    handler = MatchRequestHandler()

    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()
    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)

    Thread(target = Worker, daemon = True).start()
    # daemon=True 保证当主线程关闭，Worker 线程也关闭

    server.serve()