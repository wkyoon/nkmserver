class SponsorInfo {
    constructor(data, id) {
        this.data = data;

        this.childrencount = 0;
        this.children = [];
        this.childrenMap = {};
        this.id = id;
        this.addablesponsorid = id;
        this.addableposition = 0;

        this.getChilden(id, 1);
    }

    getChilden(id, depth) {
        let temp = [];
        let siblingIndex = 0;

        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].parentId == id) {
                temp.push(this.data[i]);
                this.children.push({
                    siblingIndex: siblingIndex,
                    depth: depth,
                    data: this.data[i],
                });
                siblingIndex++;
            }
        }

        if (temp.length > 0) {
            depth++;
            for (let j = 0; j < temp.length; j++) {
                this.childrencount++;

                this.getChilden(temp[j].id, depth);
            }
        } else {
            return;
        }
    }

    getChildInfoByDepth(depth) {
        let rtnArr = [];
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].depth == depth) {
                rtnArr.push(this.children[i].data);
            }
        }

        return { length: rtnArr.length, data: rtnArr };
    }

    async getChildenCount() {
        return this.children.length;
    }

    // depth 별 정보 가져오기

    async getSponsorInfo() {
        //console.log('---------getSponsorInfo -------------')
        var maxdepth = 0;

        for (let i = 1; i < 21; i++) {
            let arrDepth = this.getChildInfoByDepth(i);
            this.childrenMap[i] = arrDepth;
        }

        for (let i = 1; i < 21; i++) {
            let arrDepth = this.getChildInfoByDepth(i);
            if (arrDepth.length == 0) break;
        }

        // find last addaible node
        var maxDepthCount = Math.pow(2, maxdepth);

        var addablesponsor = {};

        //console.log('maxdepth',maxdepth)
        if (maxdepth > 0) {
            if (this.childrenMap[maxdepth].length >= maxDepthCount) {
                //console.log('full complete tree, addable position is first node of list depth')
                //console.log(this.childrenMap[maxdepth].data[0])

                for (let j = 0; j < this.children.length; j++) {
                    if (this.children[j].depth == maxdepth) {
                        //console.log(this.children[j].data)
                        this.addablesponsorid = this.children[j].data.id;
                        this.addableposition = 0;
                        break;
                    }
                }
                //console.log('-----------------------------')
            } else {
                //console.log('not full complete tree')
            }
        }

        //console.log('maxDepthCount',maxDepthCount)

        return {
            length: this.children.length,
            addablesponsorid: this.addablesponsorid,
            addableposition: this.addableposition,
            maxdepth: maxdepth,
            children: this.children,
            data: this.childrenMap,
        };
    }
}

module.exports = SponsorInfo;
