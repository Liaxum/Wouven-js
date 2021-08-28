import json
import random
import copy
from functions import *
from Board import *
from GameException import *

deck1       = {"heroDescId" : "kasai", "spells" : ["bloodySword", "blame", "burn", "fulgur", "explosiveCharge", "leap", "spinning", "massage", "inspiration"], "companions" : ["elely", "shutter", "championneSanglante", "seraphin"]}
deck2       = {"heroDescId" : "kasai", "spells" : ["bloodySword", "blame", "burn", "fulgur", "explosiveCharge", "leap", "spinning", "massage", "inspiration"], "companions" : ["elely", "shutter", "championneSanglante", "seraphin"]}

class Game:

    def __init__(self, name):
        self._name          = name
        # List of game states : MATCHMAKING, INIT, RUNNING
        self._gameState     = "MATCHMAKING"
        self._turn          = "blue"
        self._board         = Board()
        self._serverCmdList = []

    @property
    def name(self):
        return self._name

    @property
    def gameState(self):
        return dict(self._gameState)

    @property
    def turn(self):
        return dict(self._turn)

    @property
    def board(self):
        return copy.copy(self._board)

    @property
    def playerIdList(self):
        return list(self._board.playersDict.keys())

    @property
    def serverCmdList(self):
        return list(self._serverCmdList)

    def checkCmdArgs(self, cmdDict, keyList):
        for key in keyList:
            if not(key in cmdDict):
                raise GameException(f"No {key} field in command")

    def run(self, cmdDict):
        cmd         = cmdDict["cmd"]
        playerId    = cmdDict["playerId"]
        self._serverCmdList = []

        if (self._gameState == "MATCHMAKING"):
            if (len(self._board.playersDict) == 2):
                self.launchGame()

        elif (self._gameState == "INIT"):
            if (cmd == "RECONNECT"):
                self.initGame()
                self.sendStatus()

        else:
            if (cmd in ["RECONNECT", "ENDTURN", "MOVE", "SPELL", "SUMMON", "USE_RESERVE"]):
                self.checkTurn(playerId)
                if (cmd == "ENDTURN"):
                    self.EndTurn(playerId)

                elif (cmd == "MOVE"):
                    self.checkCmdArgs(cmdDict, ["entityId", "path"])
                    self.Move(playerId, int(cmdDict["entityId"]), cmdDict["path"])

                elif (cmd == "SPELL"):
                    self.checkCmdArgs(cmdDict, ["spellId", "targetPositionList"])
                    self.SpellCast(playerId, int(cmdDict["spellId"]), cmdDict["targetPositionList"])

                elif (cmd == "SUMMON"):
                    self.checkCmdArgs(cmdDict, ["companionId", "summonPositionList"])
                    self.Summon(playerId, int(cmdDict["companionId"]), cmdDict["summonPositionList"])

                elif (cmd == "USE_RESERVE"):
                    self.UseReserve(playerId)

                self._board.always()
                self.sendStatus()

        return self._serverCmdList

    def launchGame(self):
        self._gameState     = "INIT"
        serverCmd           = {}
        serverCmd["cmd"]    = "GAME_START"
        for playerId in list(self._board.playersDict.keys()):
            self._serverCmdList.append({"playerId" : playerId, "content" : json.dumps(serverCmd)})

    def initGame(self):
        self._gameState     = "RUNNING"
        serverCmd           = {}
        serverCmd["cmd"]    = "INIT"

        firstPlayerId = random.choice(list(self._board.playersDict.keys()))

        for playerId in list(self._board.playersDict.keys()):
            if (playerId == firstPlayerId):
                self._turn = self._board.playersDict[playerId].team
                for i in range(0, 5):
                    self._board.playersDict[playerId].draw()
            else:
                self._board.playersDict[playerId].modifyPaStock(1)
                for i in range(0, 6):
                    self._board.playersDict[playerId].draw()
            serverCmd["team"]     = self._board.playersDict[playerId].team
            self._serverCmdList.append({"playerId" : playerId, "content" : json.dumps(serverCmd)})

    def sendStatus(self):
        for playerId in list(self._board.playersDict.keys()):
            serverCmd = {}
            serverCmd["cmd"]    = "STATUS"
            serverCmd["turn"]   = self._turn
            for playerIdA in list(self._board.playersDict.keys()):
                if playerId == playerIdA:
                    serverCmd["myPlayer"]   = self._board.playersDict[playerIdA].getMyStatusDict()
                else:
                    serverCmd["opPlayer"]   = self._board.playersDict[playerIdA].getOpStatusDict()
            entitiesDict    = {}
            for entityId in list(self._board.entitiesDict.keys()):
                entitiesDict[entityId] = self._board.entitiesDict[entityId].getStatusDict()
            serverCmd["entitiesDict"] = entitiesDict
            self._serverCmdList.append({"playerId" : playerId, "content" : json.dumps(serverCmd)})

    def checkTurn(self, playerId):
        if not(playerId in list(self._board.playersDict.keys())):
            raise GameException(f"PlayerId ({playerId}) not recognized !")
        elif (self._board.playersDict[playerId].team != self._turn):
            raise GameException("Not your turn !")

    def getOpPlayerId(self, playerId):
        for pId in list(self._board.playersDict.keys()):
            if (pId != playerId):
                return pId

    def appendPlayer(self, playerId):
        if (len(self._board.playersDict) == 0):
            self._board.appendPlayer(playerId, deck1, "blue", "1")
        elif (len(self._board.playersDict) == 1):
            self._board.appendPlayer(playerId, deck2, "red", "2")
        else:
            raise GameException(f"2 playersDict already in the game {self._name} !")

    def EndTurn(self, playerId):
        self._turn = "blue" if self._turn == "red" else "red"
        self._board.endTurn(playerId)
        self._board.startTurn(self.getOpPlayerId(playerId))

    def Move(self, playerId, entityId, path):
        self._board.moveEntity(playerId, entityId, path)

    def SpellCast(self, playerId, spellId, targetPositionList):
        self._board.spellCast(playerId, spellId, targetPositionList)

    def Summon(self, playerId, companionId, summonPositionList):
        self._board.summon(playerId, companionId, summonPositionList)
    
    def UseReserve(self, playerId):
        self._board.useReserve(playerId)