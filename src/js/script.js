var sha256 = require("js-sha256");

// MERKLE TREE SCRIPTS

class Node {
  constructor(data, hash, parent = null, childleft = null, childright = null) {
    this.parent = parent;
    this.data = data;
    this.hash = hash;
    this.childleft = childleft;
    this.childright = childright;
  }

  // Make tab an array of the length of tab, but replace each case with a node
  createTree(tab) {
    let parent = 0;
    for (let i = 0; i < tab.length; i++) {
      tab[i] = new Node(tab[i], sha256(tab[i]), parent);
      if (i % 2 != 0) {
        parent++;
      }
    }
    return tab;
  }

  // make the node for the parent of two childs with the same parent
  joinChilds(tabNodes) {
    // initialise the datas of the new node
    function giveData(
      newTab,
      rightChild,
      constRight,
      newParent,
      leftChild = null
    ) {
      newTab.childleft = leftChild;
      newTab.childright = constRight;
      if (leftChild !== null) {
        newTab.hash = sha256(leftChild.hash + rightChild.hash);
        newTab.data = leftChild.data + rightChild.data;
      } else {
        newTab.hash = sha256(rightChild.hash);
        newTab.data = rightChild.data;
      }
      newTab.parent = newParent;
    }

    // create the node with two parents
    function createNodes(tab) {
      let indexNewTab = 0; // will contains all the nodes of the level
      let newParent = 0;
      let newTab = [];
      for (let indexTab = 0; indexTab < tab.length - 1; indexTab++) {
        newTab[indexNewTab] = new Node();
        if (tab[indexTab].parent === tab[indexTab + 1].parent) {
          giveData(
            newTab[indexNewTab],
            tab[indexTab + 1],
            tab[indexTab + 1],
            newParent,
            tab[indexTab]
          );
          indexNewTab++;
          if (indexNewTab % 2 == 0) {
            newParent++;
          }
        }
        if (
          tab.length >= 2 &&
          tab[indexTab].parent != tab[indexTab + 1].parent
        ) {
          giveData(newTab[indexNewTab], tab[indexTab + 1], null, newParent);
        }
      }
      return newTab;
    }

    let newTab = [];

    while (tabNodes.length > 1) {
      if (tabNodes[0].childleft == null && tabNodes[0].childright == null) {
        newTab.push(tabNodes);
      }
      tabNodes = createNodes(tabNodes);
      if (tabNodes[0].childleft != null && tabNodes[0].childright != null) {
        newTab.push(tabNodes);
      }
    }
    return newTab;
  }
}

class MerkleTree {
  constructor(tab) {
    if (Array.isArray(tab) !== false && tab != null) {
      this.tablength = tab.length;
      this.tab = tab;
      let newTree = new Node(tab);
      newTree.createTree(tab); // create the first level of nodes (leaves level)
      if (tab.length > 1) {
        this.levels = newTree.joinChilds(tab); // join the nodes with the values of the parent
        this.tab = this.levels[this.levels.length - 1]; // root
      } else {
        this.tab = tab; // root
        this.levels = tab;
      }
      this.newTab = newTree;
    } else {
      return "error, need a valid input";
    }
  }

  // returns hash of the root
  root() {
    return this.tab[0].hash;
  }

  // returns height of the tree (number of levels)
  height() {
    let node = this.tab[0];
    let index = 0;
    while (node.childleft !== null) {
      node = node.childleft;
      index++;
    }
    return index + 1;
  }

  // returns the level asked
  level(index) {
    let level = this.levels;
    let i = 0;
    let tab = [];
    if (level.length === 1) {
      tab.push(level[i].hash);
      if (level[i] != "") {
        return sha256(level[i].data);
      } else {
        return sha256("");
      }
    }
    while (i < level[index].length) {
      tab.push(level[index][i].hash);
      i++;
    }
    return tab;
  }
}

// FORM SCRIPTS

// ADD HTML FOR THE LEVEL CHOOSED
function levelDescription(myMerkle, i) {
  let levels = document.querySelectorAll(".data__level");
  for (let i = 0; i < levels.length; i++) {
    let level = levels[i];
    let toOpen = level.querySelector(".data__level--arrow").classList;
    level.addEventListener("click", function () {
      toOpen.toggle("data__level--cross");
      if (toOpen.contains("data__level--cross")) {
        let tabLevel = "";
        if (myMerkle.height() == 1) {
          tabLevel =
            tabLevel +
            "<div class='data__array'><h3 class='data__array--title'>Node " +
            (i + 1) +
            "</h3><p class='data__array--texts data__content--margin'>" +
            myMerkle.level(i) +
            "</p></div>";
        } else {
          for (let j = 0; j < myMerkle.level(i).length; j++) {
            tabLevel =
              tabLevel +
              "<div class='data__array'><h3 class='data__array--title'>Node " +
              (j + 1) +
              "</h3><p class='data__array--texts data__content--margin'>" +
              myMerkle.level(i)[j] +
              "</p></div>";
          }
        }
        myMerkle.level(i);
        level.querySelector(".data__level--array").innerHTML = tabLevel;
      } else {
        level.querySelector(".data__level--array").innerHTML = "";
      }
    });
  }
}

// SECOND SUBMIT, CHANGES THE FORM A SECOND TIME
function finishForm(tab, myForm) {
  let myMerkle = new MerkleTree(tab);
  let rootMyMerkle = document.getElementById("root");
  let levelMyMerkle = document.getElementById("levels");
  let height;
  let addInnerHtml = "";

  for (let j = 0; j < tab.length; j++) {
    addInnerHtml =
      addInnerHtml +
      "<div class='leaf__container'><h3 class='leaf__display--title'>Leaf " +
      (j + 1) +
      "</h3><p class='leaf__display'>" +
      addInnerHtml[j] +
      "</p></div>";
  }
  myForm.innerHTML =
    "<div class='leaves__form--container'>" + addInnerHtml + "</div>";
  rootMyMerkle.innerHTML = myMerkle.root();
  levelMyMerkle.innerHTML =
    "Your tree contains " + myMerkle.height() + " levels.";
  for (height = myMerkle.height(); height > 0; height--) {
    levelMyMerkle.insertAdjacentHTML(
      "afterend",
      '<div class="data__level"><div class="data__level--names"><h2 class="data__level--number">Level ' +
        height +
        "</h2><div class='data__level--arrow'></div></div><div class='data__level--array'></div></div>"
    );
  }
  levelDescription(myMerkle, height);
}

// CHANGE THE FORM OF THE HOMEPAGE
function changeForm() {
  var myForm = document.getElementById("formTree");

  myForm.onsubmit = function () {
    let nbInputs = document.getElementById("numberOfInputs").value;
    let swap = "";
    for (let i = 0; i < nbInputs; i++) {
      swap =
        swap +
        "<input class='leaf__input' type='text' placeholder='leaf " +
        (i + 1) +
        "' id='" +
        i +
        "leaf'>";
    }
    myForm.innerHTML =
      "<p class='leaves__form--description'>Add in each leaf its input :</p><div class='leaf__inputs'>" +
      swap +
      "<input type='submit' class='leaf__cta' value='Calculate your Merkle tree' id='submitagain'/></div>";
    myForm.onsubmit = function () {
      let inputTab = [];
      i = 0;
      for (let j = 0; j < nbInputs; j++) {
        inputTab[i] = document.getElementById(j + "leaf").value;
        i++;
      }
      finishForm(inputTab, swap, myForm);
      return false;
    };
    return false;
  };
}

changeForm();
