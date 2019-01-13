module.exports = [
    /**
     * If you want to add more pots, just copy the content between { },
     * And change only these items:
     * 
     * item     - Item id, can be found using built-in command or in tera datacenter... or here: https://teralore.com/
     * name     - Anything to remind you which potion is this, won't be used in code.
     * cd       - Item cooldown in seconds.
     * hp       - True if hp potion | False if mp potion.
     * use_at   - At which percentage you want the hp or mp pot to be used at. (e.g. if 50, the potion will be used if you have less than 50% of your hp or mp.
     * slaying  - Same as use_at, but only in slaying mode. (This will be ignored if it's mp potion).
     * 
     * copy the rest of values without changing.
     */
    // HP
    {
        item: 6552,
        name: "Prime Recovery Potable",
        cd: 10,
        hp: true,
        use_at: 50,
        slaying: 30,
        inCd: false,
        invQtd: 0
    },
    {
        item: 116,
        name: "Health Potion",
        cd: 30,
        hp: true,
        use_at: 20,
        slaying: -25,
        inCd: false,
        invQtd: 0
    },
    {
        item: 114,
        name: "Valkyon Health Potion",
        cd: 30,
        hp: true,
        use_at: 20,
        slaying: -25,
        inCd: false,
        invQtd: 0
    },
    {
        item: 111,
        name: "Rejuvenation Potion",
        cd: 30,
        hp: true,
        use_at: 15,
        slaying: -70,
        inCd: false,
        invQtd: 0
    },
    {
        item: 112,
        name: "Rejuvenation Potion",
        cd: 30,
        hp: true,
        use_at: 15,
        slaying: -70,
        inCd: false,
        invQtd: 0
    },
    // MP
    {
        item: 6562,
        name: "Prime Replenishment Potable",
        cd: 10,
        hp: false,
        use_at: 55,
        slaying: 0,
        inCd: false,
        invQtd: 0
    },
    {
        item: 130,
        name: "Divine Infusion",
        cd: 30,
        hp: false,
        use_at: 20,
        slaying: 0,
        inCd: false,
        invQtd: 0
    },
]
