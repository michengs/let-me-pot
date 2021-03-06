"use strict"
let AutoMp = true,						// true - Activates the auto-mana potion function		| false - Deactivates.
	AutoHp = true,						// true - Activates the auto-hp potion function			| false - Deactivates.
	notifications = false;				// true - Activates notification when a potions is used	| false - Deactivates.
const potions = require('./potions')
module.exports = function LetMePot(mod) {
const {command} = mod.command || mod.require;
	let enabled = true,
		oCid = null,
		oInCombat = false,
		oHp = 100,
		oMana = 100,
		oAlive = false,
		getPotInfo = false,
		oVehicleEx = null,
		isSlaying = false,
		oBattleground = 0,
		inBattleground = false,
		oVehicle = false,
		inContract = false,
		InventoryItems = null;
	let hpPotList = potions.filter(p => { return p.hp });
	let mpPotList = potions.filter(p => { return !p.hp });
	// ~~~ * Functions * ~~~ \\
	hpPotList.sort((a, b) => { return parseFloat(a.use_at) - parseFloat(b.use_at) });
	mpPotList.sort((a, b) => { return parseFloat(a.use_at) - parseFloat(b.use_at) });
	function EqGid(xg) {
		return (xg === oCid)
	}
	function isMe(id) {
		return (oCid === id) || (oVehicleEx && oVehicleEx === id)
	}
	function msg(msg) {
	command.message('(Let Me Pot) ' + msg);
	}
	function useItem(potInfo) {
		mod.send('C_USE_ITEM', 3, {
			gameId: oCid,
			id: potInfo.item,
			amount: 1,
			unk4: true
		})
	}
	// ~~~* Hook functions * ~~~ \\
	function sRequestContract() {
		inContract = true
	}
	function StopContract() {
		inContract = false
	}
	// ~~~ * Packet Hooks * ~~~ \\
	mod.hook('S_LOGIN', 10, (event) => {
		oCid = event.gameId
		inContract = false
	});
	mod.hook('S_SPAWN_ME', 3, (event) =>  {
		oAlive = event.alive
		inContract = false
	});
	mod.hook('S_LOAD_TOPO', 3, (event) =>   {
		oVehicleEx = null
		inContract = false
		inBattleground = event.zone === oBattleground
	});
	mod.hook('S_INVEN', 16, { order: -10 }, (event) =>   {
		if (!enabled) return;
		InventoryItems = event.first ? event.items : InventoryItems.concat(event.items);
		if (!event.more) {
			let hpamm, mpamm;
			for (let o = 0; o < hpPotList.length; o++) {
				hpamm = InventoryItems.find(item => item.id === hpPotList[o].item);
				hpPotList[o].invQtd = hpamm === undefined ? 0 : hpamm.amount;
			}
			for (let p = 0; p < mpPotList.length; p++) {
				mpamm = InventoryItems.find(item => item.id === mpPotList[p].item);
				mpPotList[p].invQtd = mpamm === undefined ? 0 : mpamm.amount;
			}
		}
	});
	mod.hook('C_USE_ITEM', 3, { order: -10 }, (event) =>    {
		if (getPotInfo && EqGid(event.gameId)) {
			console.log(`(Let Me Pot) Potion info: { item: '${event.id}' }`);
			getPotInfo = false;
			return false;
		}
	})
	mod.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, (event)  =>   {
		oBattleground = event.zone
	})
	mod.hook('S_MOUNT_VEHICLE', 2, (event)  =>   {
		if (isMe(event.gameId)) oVehicle = true
	})
	mod.hook('S_UNMOUNT_VEHICLE', 2, (event)  =>   {
		if (isMe(event.gameId)) oVehicle = false
	})
	mod.hook('S_MOUNT_VEHICLE_EX', 1, (event) =>    {
		if (EqGid(event.target)) oVehicleEx = event.vehicle
	})
	mod.hook('S_UNMOUNT_VEHICLE_EX', 1, (event) =>    {
		if (EqGid(event.target)) oVehicleEx = null
	})
	mod.hook('S_USER_STATUS', 2, (event) =>    {
		if (EqGid(event.gameId)) oInCombat = event.status === 1
	})
	mod.hook('S_CREATURE_LIFE', 2, (event) =>    {
		if (isMe(event.gameId)) oAlive = event.alive
	})
	mod.hook('S_CREATURE_CHANGE_HP', 6, (event) =>    {
		if (!enabled || !AutoHp || !EqGid(event.target)) return;
		oHp = Math.round(Number(event.curHp) / Number(event.maxHp) * 100);
		for (let i = 0; i < hpPotList.length; i++) {
			if (!hpPotList[i].inCd && ((!isSlaying && oHp <= hpPotList[i].use_at) || (isSlaying && oHp <= hpPotList[i].slaying)) && hpPotList[i].invQtd > 0 && oInCombat && oAlive && !inBattleground) {
				useItem(hpPotList[i]);
				hpPotList[i].inCd = true;
				hpPotList[i].invQtd--;
				setTimeout(() => { hpPotList[i].inCd = false; }, hpPotList[i].cd * 1000);
				if (notifications) msg('Used ' + hpPotList[i].name + ', still have ' + hpPotList[i].invQtd + ' left.');
			}
		}
	})
	mod.hook('S_PLAYER_CHANGE_MP', 1, (event) =>    {
		if (!enabled || !AutoMp || !EqGid(event.target)) return;
		oMana = Math.round(Number(event.currentMp) / Number(event.maxMp) * 100);
		for (let i = 0; i < mpPotList.length; i++) {
			if (!mpPotList[i].inCd && oMana <= mpPotList[i].use_at && mpPotList[i].invQtd > 0 && oAlive && !inBattleground && !inContract && !oVehicle) {
				useItem(mpPotList[i]);
				mpPotList[i].inCd = true;
				mpPotList[i].invQtd--;
				setTimeout(() => { mpPotList[i].inCd = false; }, mpPotList[i].cd * 1000);
				if (notifications) msg('Used ' + mpPotList[i].name + ', still have ' + mpPotList[i].invQtd + ' left.');
				break;
			}
		}
	})
	mod.hook('S_PLAYER_STAT_UPDATE', 10, (event)  =>   {
		if (!enabled) return;
		if (AutoHp) {
			oHp = Math.round(Number(event.hp) / Number(event.maxHp) * 100);
			for (let i = 0; i < hpPotList.length; i++) {
				if (!hpPotList[i].inCd && ((!isSlaying && oHp <= hpPotList[i].use_at) || (isSlaying && oHp <= hpPotList[i].slaying)) && hpPotList[i].invQtd > 0 && oInCombat && oAlive && !inBattleground) {
					useItem(hpPotList[i]);
					hpPotList[i].inCd = true;
					hpPotList[i].invQtd--;
					setTimeout(() => { hpPotList[i].inCd = false; }, hpPotList[i].cd * 1000);
					if (notifications) msg('Used ' + hpPotList[i].name + ', still have ' + hpPotList[i].invQtd + ' left.');
				}
			}
		}
		if (AutoMp) {
			oMana = Math.round(Number(event.mp) / Number(event.maxMp) * 100);
			for (let i = 0; i < mpPotList.length; i++) {
				if (!mpPotList[i].inCd && oMana <= mpPotList[i].use_at && mpPotList[i].invQtd > 0 && oAlive && !inBattleground && !inContract && !oVehicle) {
					useItem(mpPotList[i]);
					mpPotList[i].inCd = true;
					mpPotList[i].invQtd--;
					setTimeout(() => { mpPotList[i].inCd = false; }, mpPotList[i].cd * 1000);
					if (notifications) msg('Used ' + mpPotList[i].name + ', still have ' + mpPotList[i].invQtd + ' left.');
				}
			}
		}
	})
	mod.hook('S_REQUEST_CONTRACT', 'raw', sRequestContract)
	mod.hook('S_ACCEPT_CONTRACT', 'raw', StopContract)
	mod.hook('S_REJECT_CONTRACT', 'raw', StopContract)
	mod.hook('S_CANCEL_CONTRACT', 'raw', StopContract)
	mod.hook('S_GACHA_END', 'raw', StopContract)
	mod.hook('C_BIND_ITEM_EXECUTE', 'raw', StopContract)
	// ~~~ * Commands * ~~~ \\
	command.add(['letmepot', 'pot'], (key) => {
		if (!key) {
			enabled = !enabled
			msg(enabled ? 'Enabled.' : 'Disabled.')
			return
		}
		if (key) key = key.toLowerCase();
		switch (key) {
			case 'info':
			case 'potinfo':
			case 'information':
				getPotInfo = true;
				msg('Use the potion you want and watch the infos in proxy console.');
				break;
			case 'slay':
			case 'slaying':
				isSlaying = !isSlaying;
				msg('Slaying is ' + isSlaying ? 'Enabled.' : 'Disabled.');
				break;
			case 'hp':
				AutoHp = !AutoHp;
				msg('AutoHP is ' + AutoHp ? 'Enabled.' : 'Disabled.');
				break;
			case 'mp':
				AutoMp = !AutoMp;
				msg('AutoMp is ' + AutoMp ? 'Enabled.' : 'Disabled.');
				break;
			case 'msg':
			case 'notification':
			case 'notify':
			case 'notice':
				notifications = !notifications;
				msg('Notifications To ' + notifications ? 'Proxy chat.' : 'Console.');
				break;
			default:
				enabled = !enabled
				msg(enabled ? 'Enabled.' : 'Disabled.')
				break;
		}
	})
}
