console.log("Hello world!");

const aaa = "aaa";

const isHoge = "aaa";

const ishoge = "aaa";

const isSomething = "aaa";

const setdefault = "aaa";
const myID = "id";

console.log(aaa, isHoge, ishoge, isSomething, setdefault, myID);

class Foo {
    constructor(private _name: string, public home: string, hogehoge_: string) {}
}

const foo = new Foo("aa", "nn", "aaa");

console.log(foo.home);

const arr = [
    ["a", "b"],
    ["c", "d"],
];

arr.forEach(([a_, b_]) => {
    console.log(a_, b_);
});

const arr2 = [
    { a: "a", b: "b", c_d: "c" },
    { a: "a", b: "b", c_d: "c" },
];

arr2.forEach(({ a, b, c_d }) => {
    console.log(a, b, c_d);
});

const maybeStringifiedAsJSON = {
    some_pram: "a",
};

type externalJSON = {
    some_pram: string;
};
