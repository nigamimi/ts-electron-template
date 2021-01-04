console.log("Hello world!");

const aaa = "aaa";

const isHoge = "aaa";

const ishoge = "aaa";

const isSomething = "aaa";

const setdefault = "aaa";
//strict camel case warning
const myID = "id";

console.log(aaa, isHoge, ishoge, isSomething, setdefault, myID);

class Foo {
    //unsed warning
    constructor(private _name: string, public home: string, hogehoge_: string) {}
}

const foo = new Foo("aa", "nn", "aaa");

console.log(foo.home);

const arr = [
    ["a", "b"],
    ["c", "d"],
];

//warning
arr.forEach(([a, b]) => {
    console.log(b);
});
arr.forEach(([_, b_]) => {
    console.log(b_);
});
arr.forEach(([_a, b_]) => {
    console.log(b_);
});
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

//casing warning
const _maybeStringifiedAsJson = {
    some_pram: "a",
};

//unused warning
type ExternalJson = {
    some_pram: string;
};
