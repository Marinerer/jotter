/**
 * 将列表数据转换为树形数据 (迭代方式)
 * 1. 首先创建一个 map 对象，用于通过 id 快速查找节点。
 * 2. 遍历列表，将每个节点添加到 map 中，并初始化 children 数组。
 * 3. 再次遍历列表，将每个节点添加到其父节点的 children 数组中。
 * 4. 最后返回根节点数组。
 * 
 * 复杂度分析：
 * 1. 时间复杂度：O(n)，其中 n 是列表的长度。
 * 2. 空间复杂度：O(n)，其中 n 是列表的长度。
 */

type ListItem = {
  [key: string]: any;
};

// 配置项类型
//! 需要注意 childrenKey 的类型推导
type Options<T extends ListItem, R extends ListItem, K extends string = "children"> = {
  /**
   * 节点标识字段
   * @default "id"
   */
  idKey?: string;

  /**
   * 父节点标识字段
   * @default "parentId"
   */
  parentKey?: string;

  /**
   * 子节点字段
   * @default "children"
   */
  childrenKey?: K;

  /**
   * 转换节点函数, 默认copy当前节点
   * @param item 当前节点
   * @returns 
   */
  transform?: (item: T) => R;

  /**
   * 判断是否为根节点
   * @param item 当前节点
   * @returns 
   */
  isRoot?: (item: T) => boolean;
};

// 定义树节点类型，结合 transform 返回值和动态的 children 字段
// 使用映射类型 [P in K] 来创建动态的 children 字段名
type TreeNode<R extends ListItem, K extends string> = R & {
  [P in K]: TreeNode<R, K>[];
};

/**
 * Converts a flat list of items into a hierarchical tree structure.
 * @param list List data
 * @param options Options
 * @returns tree data
 */
function listToTree<T extends ListItem, R extends ListItem = T, K extends string = "children">(
  list: T[],
  options: Options<T, R, K> = {} as Options<T, R, K>
): TreeNode<R, K>[] {
  const {
      idKey = 'id',
      parentKey = 'parentId',
      childrenKey = 'children' as K, //默认值的类型断言
      transform = ((item: T) => ({ ...item } as unknown as R)), //! 注意需要类型断言
      isRoot = ((item: T) => !item[parentKey]),
  } = options;

  if (!Array.isArray(list)) {
      throw new TypeError('Expected an array of items');
  }

  if (!list.length) {
      return [];
  }

  if (typeof transform !== 'function') {
      throw new TypeError('Expected transform to be a function');
  }

  if (typeof isRoot !== 'function') {
     throw new TypeError('Expected isRoot to be a function');
  }

  const map: Record<string | number, TreeNode<R, K>> = {};
  const roots: TreeNode<R, K>[] = [];

  // 建立映射关系，方便通过 id 快速查找
  for (const node of list) {
      map[node[idKey]] = {
          ...transform(node),
          [childrenKey]: [],
      } as TreeNode<R, K>;
  }

  // 构建树形结构
  for (const node of list) {
      const parentId = node[parentKey];
      
      if (isRoot(node)) {
        roots.push(map[node[idKey]]);
      } else {
          const parent = map[parentId];
          if (parent) {
            parent[childrenKey].push(map[node[idKey]]);
          }
      }
  }

  return roots;
}

export default listToTree;