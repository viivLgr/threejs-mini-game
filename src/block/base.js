import confBlock from '../../confs/block-conf';
export default class BaseBlock{
  constructor(type) {
    this.type = type // cuboid | cylinder
    this.height = confBlock.height
    this.width = confBlock.width
  }
}