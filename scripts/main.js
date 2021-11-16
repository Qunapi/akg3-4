'use strict';

import { Model } from './model.js';
import * as Resources from './resources.js';
import { Constants } from './constants.js';
import { Game } from './game.js';

window.onload = () => {
  new Game().start();
};

function setNewObj(newObj) {
  // Load OBJ file line by line
  newObj = newObj.replace(/  +/g, ' ');
  const lines = newObj.split('\n');
  let positions = [];
  let texCoords = [];
  let normals = [];
  let indices = [];

  console.log(newObj);
  for (const line of lines) {
    const tokens = line.replace('\r', '').split(' ');
    switch (tokens[0]) {
      case 'v':
        let v = [];
        for (let i = 0; i < 3; i++) v.push(parseFloat(tokens[i + 1]));
        positions.push(v);
        break;

      case 'vt':
        let tc = [];
        for (let i = 0; i < 2; i++) tc.push(parseFloat(tokens[i + 1]));
        texCoords.push(tc);
        break;

      case 'vn':
        let vn = [];
        for (let i = 0; i < 3; i++) vn.push(parseFloat(tokens[i + 1]));
        normals.push(vn);
        break;

      case 'f': {
        if (tokens.length > 4) {
          const newFArray = [];
          const polToTriangle = getTrianglesFromPolygon(tokens.length - 1);
          polToTriangle?.forEach(positions => {
            newFArray.push([
              tokens[positions[0] + 1],
              tokens[positions[1] + 1],
              tokens[positions[2] + 1],
            ]);
          });

          newFArray.forEach(arrayWithStrings => {
            let f = [];
            arrayWithStrings.forEach(_string => {
              let v = [];
              const da = _string.split('/');
              da.forEach(valueToParse => {
                const value = parseInt(valueToParse);
                if (isNaN(value)) {
                  // console.log('nan', da);
                }
                v.push(value);
              });
              f.push(v);
            });

            indices.push(f);
          });
          break;
        } else {
          let f = [];
          for (let i = 0; i < 3; i++) {
            let v = [];
            for (let j = 0; j < 3; j++)
              v.push(parseInt(tokens[i + 1].split('/')[j]));
            f.push(v);
          }
          indices.push(f);
          break;
        }
      }
    }
  }
  Constants.loadedResources++;
  Resources.models['man'] = new Model(positions, texCoords, normals, indices);
}

function getTrianglesFromPolygon(numOfCorners) {
  const res = [];
  let arrNum = new Array(numOfCorners).fill(0).map((_, i) => i);
  let currentPos = 0;
  for (let i = 0; i < numOfCorners - 2; ++i) {
    const { length } = arrNum;
    res.push([
      arrNum[currentPos % length],
      arrNum[(currentPos + 1) % length],
      arrNum[(currentPos + 2) % length],
    ]);
    currentPos = (currentPos + 1) % length;
    // eslint-disable-next-line no-loop-func
    arrNum = arrNum.filter((_, pos) => pos !== currentPos);
  }
  return res;
}

const fileInput = document.getElementById('file_input');
fileInput.onchange = function onChangeFile() {
  const fr = new FileReader();
  fr.onload = function onLoadFile() {
    setNewObj(this.result);
  };
  fr.readAsText(this.files[0]);
};
