const path=require('path');
const fs=require('fs');

const p=path.join(
  path.dirname(process.mainModule.filename),
  'data'
)

class IO{

  static  saveToDisk(data,filename){
   return  new Promise(((resolve, reject) => {
      fs.writeFile(path.join(p, filename), JSON.stringify(data), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }))
  }
  static readFromDisk(filename){
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(p, filename), 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      })

    })
  }
}

module.exports=IO;
