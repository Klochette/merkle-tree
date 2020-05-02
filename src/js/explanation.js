// Creates a div for "What's a Merkle tree ?" and toggle the icon close / open

function treeExplanation() {
  let merkleDescription = document.querySelector(".merkleTree__presentation");
  let descriptionMerkle = merkleDescription.querySelector(
    ".merkleTree__presentation--arrow"
  );
  let toOpen = descriptionMerkle.classList;
  merkleDescription.addEventListener("click", function () {
    toOpen.toggle("merkleTree__presentation--cross");
    if (toOpen.contains("merkleTree__presentation--cross")) {
      document.querySelector(".merkleTree__description").innerHTML =
        "In cryptography and computer science, a hash tree or Merkle tree is a tree in which every leaf node is labelled with the cryptographic hash of a data block, and every non-leaf node is labelled with the cryptographic hash in the labels of its child nodes. <br/><br/>The concept of hash trees is named after Ralph Merkle who patented it in 1979.";
      document
        .querySelector(".merkleTree__description")
        .classList.add("merkleTree__description--margin");
    } else {
      document.querySelector(".merkleTree__description").innerHTML = "";
      document
        .querySelector(".merkleTree__description")
        .classList.remove("merkleTree__description--margin");
    }
  });
}

treeExplanation();
