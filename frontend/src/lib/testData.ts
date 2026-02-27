import { IGDBEvent, QuickSearch, SearchResults, TGDBPlatformDetailsResponseData } from "./types";

export const consolePartialTestData = [
    {
        "id": 139,
        "name": "1292 Advanced Programmable Video System",
        "platform_logo": {
            "id": 136,
            "alpha_channel": false,
            "animated": false,
            "image_id": "yfdqsudagw0av25dawjr",
            "checksum": "343f1c9d-3317-c1c4-d5c0-f50d52efcbdc"
        },
        "slug": "1292-advanced-programmable-video-system",
        "versions": [
            {
                "id": 213,
                "platform_version_release_dates": [
                    {
                        "id": 696,
                        "date": 315446400
                    }
                ],
                "slug": "acetronic-mpu-1000"
            },
            {
                "id": 197,
                "platform_version_release_dates": [
                    {
                        "id": 697,
                        "date": 283910400
                    }
                ],
                "slug": "audiosonic-pp-1292-advanced-programmable-video-system"
            }
        ],
        "checksum": "bdf2f978-1819-d3ef-864a-a3eff4649034",
        "platform_type": {
            "id": 1,
            "name": "Console"
        }
    },
    {
        "id": 50,
        "abbreviation": "3DO",
        "alternative_name": "3DO",
        "name": "3DO Interactive Multiplayer",
        "platform_logo": {
            "id": 282,
            "alpha_channel": true,
            "animated": false,
            "image_id": "pl7u",
            "checksum": "844e7040-04a9-d508-72fd-23d7031a3e68"
        },
        "slug": "3do",
        "versions": [
            {
                "id": 18,
                "platform_version_release_dates": [
                    {
                        "id": 117,
                        "date": 749692800
                    },
                    {
                        "id": 118,
                        "date": 764121600
                    },
                    {
                        "id": 698,
                        "date": 771292800
                    },
                    {
                        "id": 699,
                        "date": 786412800
                    }
                ],
                "slug": "initial-version"
            }
        ],
        "checksum": "d0ca18d4-b12a-d1c3-173c-75b32ff483f4",
        "platform_type": {
            "id": 1,
            "name": "Console"
        }
    },
    {
        "id": 416,
        "abbreviation": "64DD",
        "alternative_name": "Nintendo 64DD",
        "name": "64DD",
        "platform_logo": {
            "id": 692,
            "alpha_channel": true,
            "animated": false,
            "image_id": "plj8",
            "checksum": "aa540d0d-0898-5e2d-ca4e-6d9131069b3c"
        },
        "slug": "64dd",
        "versions": [
            {
                "id": 556,
                "platform_version_release_dates": [
                    {
                        "id": 662,
                        "date": 945043200
                    }
                ],
                "slug": "initial-version"
            }
        ],
        "checksum": "62f98481-2f80-3d55-bba6-03300ecf3941",
        "platform_type": {
            "id": 1,
            "name": "Console"
        }
    },
    {
        "id": 116,
        "abbreviation": "Acorn Archimedes",
        "name": "Acorn Archimedes",
        "platform_logo": {
            "id": 388,
            "alpha_channel": false,
            "animated": false,
            "image_id": "plas",
            "checksum": "b30d1905-0f02-c11f-f0bc-8200b1386851"
        },
        "slug": "acorn-archimedes",
        "versions": [
            {
                "id": 154,
                "platform_version_release_dates": [
                    {
                        "id": 555,
                        "date": 567907200
                    },
                    {
                        "id": 556,
                        "date": 549504000
                    }
                ],
                "slug": "initial-version"
            }
        ],
        "checksum": "6abaac45-9689-0ab5-b1e2-838785bd5557",
        "platform_type": {
            "id": 6,
            "name": "Computer"
        }
    },
    {
        "id": 134,
        "abbreviation": "Acorn Electron",
        "name": "Acorn Electron",
        "platform_logo": {
            "id": 301,
            "alpha_channel": true,
            "animated": false,
            "image_id": "pl8d",
            "checksum": "65bb45b7-044e-45f4-8da3-35bfa6120082"
        },
        "slug": "acorn-electron",
        "versions": [
            {
                "id": 184,
                "slug": "initial-version"
            }
        ],
        "checksum": "6c2225b6-d043-7771-e4c0-886fd508223b",
        "platform_type": {
            "id": 6,
            "name": "Computer"
        }
    },
    {
        "id": 507,
        "alternative_name": "BeenaLite",
        "name": "Advanced Pico Beena",
        "platform_logo": {
            "id": 894,
            "alpha_channel": false,
            "animated": false,
            "image_id": "plou",
            "checksum": "19db4da4-271d-90bf-d7b6-9576ebe194d3"
        },
        "slug": "advanced-pico-beena",
        "versions": [
            {
                "id": 726,
                "platform_version_release_dates": [
                    {
                        "id": 907,
                        "date": 1123286400
                    }
                ],
                "slug": "advanced-pico-beena"
            },
            {
                "id": 727,
                "slug": "beenalite"
            }
        ],
        "checksum": "5f883564-a7a1-0aa3-eb1b-e6e251e4d77a",
        "platform_type": {
            "id": 1,
            "name": "Console"
        }
    },
    {
        "id": 389,
        "name": "AirConsole",
        "platform_logo": {
            "id": 746,
            "alpha_channel": true,
            "animated": false,
            "image_id": "plkq",
            "checksum": "a023b973-b298-b591-a37d-11ad71ab832d"
        },
        "slug": "airconsole",
        "versions": [
            {
                "id": 511,
                "slug": "initial-version"
            }
        ],
        "checksum": "a77055cc-db7f-5dec-b286-f20e3203e469",
        "platform_type": {
            "id": 3,
            "name": "Platform"
        }
    },
    {
        "id": 132,
        "abbreviation": "FireTV",
        "name": "Amazon Fire TV",
        "platform_logo": {
            "id": 325,
            "alpha_channel": true,
            "animated": false,
            "image_id": "pl91",
            "checksum": "37b34296-0bf1-de22-9f8e-af734fdf6800"
        },
        "slug": "firetv",
        "versions": [
            {
                "id": 176,
                "slug": "initial-version"
            }
        ],
        "checksum": "b127b736-52c5-a7d3-41ea-c933160404f6",
        "platform_type": {
            "id": 3,
            "name": "Platform"
        }
    },
    {
        "id": 16,
        "abbreviation": "Amiga",
        "alternative_name": "Commodore Amiga",
        "name": "Amiga",
        "slug": "amiga",
        "versions": [
            {
                "id": 111,
                "slug": "amiga-a-2000"
            },
            {
                "id": 112,
                "slug": "amiga-a-3000"
            },
            {
                "id": 19,
                "platform_version_release_dates": [
                    {
                        "id": 134,
                        "date": 560044800
                    }
                ],
                "slug": "amiga-a-500"
            },
            {
                "id": 109,
                "platform_version_release_dates": [
                    {
                        "id": 238,
                        "date": 699408000
                    }
                ],
                "slug": "amiga-a-600"
            },
            {
                "id": 113,
                "slug": "amiga-a-3000t"
            },
            {
                "id": 522,
                "platform_version_release_dates": [
                    {
                        "id": 638,
                        "date": 719625600
                    }
                ],
                "slug": "amiga-a-1200"
            },
            {
                "id": 110,
                "slug": "amiga-a-1000"
            }
        ],
        "checksum": "11e48bee-0a52-e44f-f5fc-c5f0a3118249",
        "platform_type": {
            "id": 6,
            "name": "Computer"
        }
    },
    {
        "id": 114,
        "abbreviation": "Amiga CD32",
        "name": "Amiga CD32",
        "platform_logo": {
            "id": 283,
            "alpha_channel": true,
            "animated": false,
            "image_id": "pl7v",
            "checksum": "c047f2d6-d142-8d94-a0c4-72f1fd427dc2"
        },
        "slug": "amiga-cd32",
        "versions": [
            {
                "id": 152,
                "platform_version_release_dates": [
                    {
                        "id": 506,
                        "date": 748051200
                    }
                ],
                "slug": "initial-version"
            }
        ],
        "checksum": "5eeaa315-7f58-081f-065f-1525f31d15af",
        "platform_type": {
            "id": 1,
            "name": "Console"
        }
    },
    {
        "id": 25,
        "abbreviation": "ACPC",
        "alternative_name": "Colour Personal Computer",
        "name": "Amstrad CPC",
        "platform_logo": {
            "id": 845,
            "alpha_channel": false,
            "animated": false,
            "image_id": "plnh",
            "checksum": "ced17c32-92b1-8ea7-6b60-328af0f95bda"
        },
        "slug": "acpc",
        "versions": [
            {
                "id": 525,
                "platform_version_release_dates": [
                    {
                        "id": 684,
                        "date": 487468800
                    },
                    {
                        "id": 685,
                        "date": 492912000
                    }
                ],
                "slug": "amstrad-cpc-6128"
            },
            {
                "id": 20,
                "platform_version_release_dates": [
                    {
                        "id": 775,
                        "date": 450489600
                    }
                ],
                "slug": "cpc-464"
            }
        ],
        "checksum": "69b3cb27-f443-64aa-3cfa-ea3cca608d1f",
        "platform_type": {
            "id": 6,
            "name": "Computer"
        }
    },
    {
        "id": 506,
        "abbreviation": "GX4000",
        "name": "Amstrad GX4000",
        "platform_logo": {
            "id": 893,
            "alpha_channel": false,
            "animated": false,
            "image_id": "plot",
            "checksum": "88384d18-abd4-acb4-6b06-0a09dea5034b"
        },
        "slug": "gx4000",
        "versions": [
            {
                "id": 725,
                "platform_version_release_dates": [
                    {
                        "id": 906,
                        "date": 652147200
                    }
                ],
                "slug": "initial-version"
            }
        ],
        "checksum": "619af904-230f-65ce-7178-c269e5eb9e4a",
        "platform_type": {
            "id": 1,
            "name": "Console"
        }
    },
    {
        "id": 154,
        "abbreviation": "APCW",
        "name": "Amstrad PCW",
        "platform_logo": {
            "id": 547,
            "alpha_channel": false,
            "animated": false,
            "image_id": "plf7",
            "checksum": "75096865-cbcc-283f-b48f-ffcfd79616ab"
        },
        "slug": "apcw",
        "versions": [
            {
                "id": 219,
                "platform_version_release_dates": [
                    {
                        "id": 557,
                        "date": 494380800
                    }
                ],
                "slug": "initial-version"
            }
        ],
        "checksum": "b3b0a695-4127-2067-8f1e-65ace68ade72",
        "platform_type": {
            "id": 6,
            "name": "Computer"
        }
    },
    {
        "id": 100,
        "abbreviation": "analogueelectronics",
        "name": "Analogue electronics",
        "slug": "analogueelectronics",
        "versions": [
            {
                "id": 126,
                "slug": "initial-version"
            }
        ],
        "checksum": "01951a13-ac9d-9f80-2b02-f9a818d83326"
    },
    {
        "id": 34,
        "abbreviation": "Android",
        "alternative_name": "Infocusa3",
        "name": "Android",
        "platform_logo": {
            "id": 831,
            "alpha_channel": true,
            "animated": false,
            "image_id": "pln3",
            "checksum": "b8d72acf-c99b-dae0-5465-9071aa2c092f"
        },
        "slug": "android",
        "versions": [
            {
                "id": 8,
                "platform_version_release_dates": [
                    {
                        "id": 110,
                        "date": 1297209600
                    }
                ],
                "slug": "gingerbread-2-3-3"
            },
            {
                "id": 9,
                "platform_version_release_dates": [
                    {
                        "id": 109,
                        "date": 1310688000
                    }
                ],
                "slug": "honeycomb-3-2"
            },
            {
                "id": 10,
                "platform_version_release_dates": [
                    {
                        "id": 108,
                        "date": 1323993600
                    }
                ],
                "slug": "ice-cream-sandwich"
            },
            {
                "id": 11,
                "platform_version_release_dates": [
                    {
                        "id": 107,
                        "date": 1341792000
                    }
                ],
                "slug": "jelly-bean-4-1-x-4-3-x"
            },
            {
                "id": 237,
                "platform_version_release_dates": [
                    {
                        "id": 273,
                        "date": 1423094400
                    }
                ],
                "slug": "marshmallow"
            },
            {
                "id": 12,
                "platform_version_release_dates": [
                    {
                        "id": 102,
                        "date": 1383177600
                    }
                ],
                "slug": "kitkat"
            },
            {
                "id": 320,
                "platform_version_release_dates": [
                    {
                        "id": 398,
                        "date": 1533513600
                    }
                ],
                "slug": "pie"
            },
            {
                "id": 526,
                "slug": "10"
            },
            {
                "id": 7,
                "platform_version_release_dates": [
                    {
                        "id": 106,
                        "date": 1274313600
                    }
                ],
                "slug": "froyo-2-2"
            },
            {
                "id": 543,
                "slug": "android-cupcake"
            },
            {
                "id": 544,
                "slug": "android-donut"
            },
            {
                "id": 545,
                "slug": "android-eclair"
            },
            {
                "id": 546,
                "slug": "android-froyo"
            },
            {
                "id": 236,
                "platform_version_release_dates": [
                    {
                        "id": 272,
                        "date": 1415750400
                    }
                ],
                "slug": "lollipop"
            },
            {
                "id": 238,
                "platform_version_release_dates": [
                    {
                        "id": 274,
                        "date": 1471824000
                    }
                ],
                "slug": "nougat"
            },
            {
                "id": 527,
                "slug": "11"
            },
            {
                "id": 528,
                "slug": "12"
            },
            {
                "id": 541,
                "slug": "android-1-dot-0"
            },
            {
                "id": 542,
                "slug": "android-1-dot-1"
            },
            {
                "id": 672,
                "platform_version_release_dates": [
                    {
                        "id": 777,
                        "date": 1660521600
                    }
                ],
                "slug": "android-13"
            },
            {
                "id": 239,
                "platform_version_release_dates": [
                    {
                        "id": 275,
                        "date": 1534809600
                    }
                ],
                "slug": "oreo"
            }
        ],
        "checksum": "484e4cc5-70c7-dcbe-ae74-c3185a6888dc",
        "platform_type": {
            "id": 4,
            "name": "Operating_system"
        }
    },
    {
        "id": 75,
        "abbreviation": "Apple][",
        "alternative_name": "apple ][",
        "name": "Apple II",
        "platform_logo": {
            "id": 315,
            "alpha_channel": true,
            "animated": false,
            "image_id": "pl8r",
            "checksum": "9cae230d-60cc-f79c-1b04-67dfe0a3b238"
        },
        "slug": "appleii",
        "versions": [
            {
                "id": 21,
                "platform_version_release_dates": [
                    {
                        "id": 135,
                        "date": 234748800
                    },
                    {
                        "id": 136,
                        "date": 283910400
                    },
                    {
                        "id": 137,
                        "date": 283910400
                    }
                ],
                "slug": "initial-version-071433c7-3175-44f5-9941-30ea1f42ff58"
            }
        ],
        "checksum": "a30a93bf-3fba-5fb7-4c20-11b115e81949",
        "platform_type": {
            "id": 6,
            "name": "Computer"
        }
    },
    {
        "id": 115,
        "name": "Apple IIGS",
        "platform_logo": {
            "id": 295,
            "alpha_channel": true,
            "animated": false,
            "image_id": "pl87",
            "checksum": "1d151d93-bbb5-c7d2-3ef8-c30ead9445d4"
        },
        "slug": "apple-iigs",
        "versions": [
            {
                "id": 153,
                "slug": "initial-version"
            }
        ],
        "checksum": "3e89ea22-7494-1fd0-7015-3d910e5ce9d8",
        "platform_type": {
            "id": 6,
            "name": "Computer"
        }
    },
    {
        "id": 476,
        "alternative_name": "PiPP!N",
        "name": "Apple Pippin",
        "platform_logo": {
            "id": 851,
            "alpha_channel": false,
            "animated": false,
            "image_id": "plnn",
            "checksum": "0e1ad6aa-3dcb-08bb-a894-c0a953283c0b"
        },
        "slug": "apple-pippin",
        "versions": [
            {
                "id": 693,
                "platform_version_release_dates": [
                    {
                        "id": 850,
                        "date": 851990400
                    }
                ],
                "slug": "initial-version"
            }
        ],
        "checksum": "0f541de9-a045-d22f-d382-8fb7f17698e3",
        "platform_type": {
            "id": 1,
            "name": "Console"
        }
    },
    {
        "id": 52,
        "abbreviation": "Arcade",
        "name": "Arcade",
        "platform_logo": {
            "id": 827,
            "alpha_channel": true,
            "animated": false,
            "image_id": "plmz",
            "checksum": "c5266661-154a-7ac3-e056-c69f54a39dda"
        },
        "slug": "arcade",
        "versions": [
            {
                "id": 696,
                "slug": "sega-alls"
            },
            {
                "id": 636,
                "platform_version_release_dates": [
                    {
                        "id": 722,
                        "date": 694137600
                    }
                ],
                "slug": "mega-play"
            },
            {
                "id": 637,
                "platform_version_release_dates": [
                    {
                        "id": 723,
                        "date": 909878400
                    },
                    {
                        "id": 724,
                        "date": 915062400
                    }
                ],
                "slug": "naomi"
            },
            {
                "id": 634,
                "platform_version_release_dates": [
                    {
                        "id": 719,
                        "date": 820368000
                    }
                ],
                "slug": "sega-system-e"
            },
            {
                "id": 635,
                "platform_version_release_dates": [
                    {
                        "id": 720,
                        "date": 631065600
                    },
                    {
                        "id": 721,
                        "date": 631065600
                    }
                ],
                "slug": "mega-tech-system"
            },
            {
                "id": 22,
                "platform_version_release_dates": [
                    {
                        "id": 726,
                        "date": 62985600
                    }
                ],
                "slug": "initial-version-9ef509be-a00a-427e-9b78-93c4a10e04b6"
            },
            {
                "id": 641,
                "platform_version_release_dates": [
                    {
                        "id": 729,
                        "date": 523238400
                    }
                ],
                "slug": "playchoice-10"
            },
            {
                "id": 640,
                "platform_version_release_dates": [
                    {
                        "id": 728,
                        "date": 441763200
                    }
                ],
                "slug": "nintendo-vs-system"
            },
            {
                "id": 681,
                "platform_version_release_dates": [
                    {
                        "id": 844,
                        "date": 915062400
                    }
                ],
                "slug": "aleck-64"
            },
            {
                "id": 651,
                "platform_version_release_dates": [
                    {
                        "id": 743,
                        "date": 978220800
                    }
                ],
                "slug": "naomi-2"
            },
            {
                "id": 649,
                "platform_version_release_dates": [
                    {
                        "id": 740,
                        "date": 407548800
                    },
                    {
                        "id": 741,
                        "date": 425865600
                    }
                ],
                "slug": "sega-system-1"
            },
            {
                "id": 650,
                "platform_version_release_dates": [
                    {
                        "id": 742,
                        "date": 925516800
                    }
                ],
                "slug": "sega-hikaru"
            },
            {
                "id": 638,
                "platform_version_release_dates": [
                    {
                        "id": 725,
                        "date": 694137600
                    }
                ],
                "slug": "nintendo-super-system"
            },
            {
                "id": 652,
                "platform_version_release_dates": [
                    {
                        "id": 744,
                        "date": 1049155200
                    },
                    {
                        "id": 745,
                        "date": 1104451200
                    },
                    {
                        "id": 746,
                        "date": 1104451200
                    }
                ],
                "slug": "atomiswave"
            },
            {
                "id": 668,
                "slug": "soft-desk-10"
            },
            {
                "id": 665,
                "slug": "mark-iii-soft-desk-10"
            },
            {
                "id": 669,
                "platform_version_release_dates": [
                    {
                        "id": 765,
                        "date": 762480000
                    },
                    {
                        "id": 766,
                        "date": 820368000
                    }
                ],
                "slug": "sega-titan-video"
            },
            {
                "id": 666,
                "slug": "mark-iii-soft-desk-5"
            },
            {
                "id": 667,
                "platform_version_release_dates": [
                    {
                        "id": 764,
                        "date": 1262217600
                    }
                ],
                "slug": "sega-ringedge"
            },
            {
                "id": 664,
                "platform_version_release_dates": [
                    {
                        "id": 761,
                        "date": 1041292800
                    },
                    {
                        "id": 762,
                        "date": 1041292800
                    },
                    {
                        "id": 763,
                        "date": 1041292800
                    }
                ],
                "slug": "triforce"
            }
        ],
        "checksum": "9ea37685-d483-c419-3591-7299d3b0af16",
        "platform_type": {
            "id": 2,
            "name": "Arcade"
        }
    },
    {
        "id": 473,
        "name": "Arcadia 2001",
        "platform_logo": {
            "id": 848,
            "alpha_channel": true,
            "animated": false,
            "image_id": "plnk",
            "checksum": "35052516-3a8e-3572-626e-322334dd3c3f"
        },
        "slug": "arcadia-2001",
        "versions": [
            {
                "id": 683,
                "platform_version_release_dates": [
                    {
                        "id": 846,
                        "date": 381369600
                    }
                ],
                "slug": "initial-version"
            }
        ],
        "checksum": "40d15973-6341-e0e1-6dd4-804877b00030",
        "platform_type": {
            "id": 1,
            "name": "Console"
        }
    }
]


export const consoleTestData: TGDBPlatformDetailsResponseData = {
    "details": {
        "id": 7,
        "name": "Nintendo Entertainment System (NES)",
        "alias": "nintendo-entertainment-system-nes",
        "icon": "nintendo-entertainment-system-nes-1336524652.png",
        "console": "7.png",
        "controller": "7.png",
        "developer": "Nintendo",
        "manufacturer": "Nintendo",
        "media": "Cartridge",
        "cpu": "Ricoh 2A03",
        "memory": "2KB RAM",
        "graphics": "RP2C02",
        "sound": "Pulse Code Modulation",
        "maxcontrollers": "2",
        "display": "RGB",
        "overview": "The Nintendo Entertainment System (also abbreviated as NES or simply called Nintendo) is an 8-bit video game console that was released by Nintendo in North America during 1985, in Europe during 1986 and Australia in 1987. In most of Asia, including Japan (where it was first launched in 1983), China, Vietnam, Singapore, the Middle East and Hong Kong, it was released as the Family Computer, commonly shortened as either the romanized contraction Famicom, or abbreviated to FC. In South Korea, it was known as the Hyundai Comboy, and was distributed by Hynix which then was known as Hyundai Electronics.\r\n\r\nAs the best-selling gaming console of its time, the NES helped revitalize the US video game industry following the video game crash of 1983, and set the standard for subsequent consoles of its generation. With the NES, Nintendo introduced a now-standard business model of licensing third-party developers, authorizing them to produce and distribute software for Nintendo's platform.",
        "youtube": null
    },
    "images": {
        "base_urls": {
            "original": "https://cdn.thegamesdb.net/images/original/",
            "small": "https://cdn.thegamesdb.net/images/small/",
            "thumb": "https://cdn.thegamesdb.net/images/thumb/",
            "cropped_center_thumb": "https://cdn.thegamesdb.net/images/cropped_center_thumb/",
            "medium": "https://cdn.thegamesdb.net/images/medium/",
            "large": "https://cdn.thegamesdb.net/images/large/"
        },
        "images": {
            "banners": [
                {
                    "id": 22,
                    "filename": "platform/banners/7-1.png"
                },
                {
                    "id": 83,
                    "filename": "platform/banners/7-2.jpg"
                }
            ],
            "fanarts": [
                {
                    "id": 38,
                    "filename": "platform/fanart/7-1.jpg"
                },
                {
                    "id": 39,
                    "filename": "platform/fanart/7-2.jpg"
                },
                {
                    "id": 60,
                    "filename": "platform/fanart/7-3.jpg"
                },
                {
                    "id": 128,
                    "filename": "platform/fanart/7-4.jpg"
                },
                {
                    "id": 184,
                    "filename": "platform/fanart/7-5.jpg"
                },
                {
                    "id": 185,
                    "filename": "platform/fanart/7-6.jpg"
                }
            ],
            "boxarts": [
                {
                    "id": 222,
                    "filename": "platform/boxart/7-2.jpg"
                }
            ],
            "icons": [
                {
                    "id": 282,
                    "filename": "/consoles/png48/nintendo-entertainment-system-nes-1336524652.png"
                }
            ],
            "others": []
        }
    }
}


export const searchResultsTesData: SearchResults = {
    games: [
        {
            "id": 17,
            "cover": {
                "id": 91143,
                "alpha_channel": false,
                "animated": false,
                "game": 17,
                "height": 1473,
                "image_id": "co1ybr",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co1ybr.jpg",
                "width": 1105,
                "checksum": "b6813229-b9a9-2ce8-429f-d2cf69844663"
            },
            "first_release_date": 984614400,
            "name": "Fallout Tactics: Brotherhood of Steel"
        },
        {
            "id": 45128,
            "cover": {
                "id": 199046,
                "alpha_channel": true,
                "animated": false,
                "game": 45128,
                "height": 800,
                "image_id": "co49l2",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co49l2.jpg",
                "width": 600,
                "checksum": "08d12f6e-071a-dc17-0c5a-300aaa65f550"
            },
            "first_release_date": 1138752000,
            "name": "Fallout Trilogy"
        },
        {
            "id": 14,
            "cover": {
                "id": 386700,
                "alpha_channel": false,
                "animated": false,
                "game": 14,
                "height": 1600,
                "image_id": "co8ado",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co8ado.jpg",
                "width": 1200,
                "checksum": "98718c7e-c3d7-2aa6-8289-3886e8267b6b"
            },
            "first_release_date": 909619200,
            "name": "Fallout 2"
        },
        {
            "id": 13,
            "cover": {
                "id": 91139,
                "alpha_channel": false,
                "animated": false,
                "game": 13,
                "height": 1473,
                "image_id": "co1ybn",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co1ybn.jpg",
                "width": 1105,
                "checksum": "01c97113-784d-f496-8bd1-dc06a84999b9"
            },
            "first_release_date": 876441600,
            "name": "Fallout: A Post Nuclear Role Playing Game"
        },
        {
            "id": 229978,
            "cover": {
                "id": 277351,
                "alpha_channel": false,
                "animated": false,
                "game": 229978,
                "height": 1240,
                "image_id": "co5y07",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co5y07.jpg",
                "width": 930,
                "checksum": "fdee5cf8-1b97-ec1f-124f-49b8eddee220"
            },
            "first_release_date": 1672444800,
            "name": "Fallout 2 Remake"
        },
        {
            "id": 77192,
            "cover": {
                "id": 371334,
                "alpha_channel": true,
                "animated": false,
                "game": 77192,
                "height": 800,
                "image_id": "co7yiu",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co7yiu.jpg",
                "width": 600,
                "checksum": "bd3e6d9f-b7ce-3647-ffe2-6d4a94b44dcc"
            },
            "name": "Fallout Online"
        },
        {
            "id": 202170,
            "cover": {
                "id": 371345,
                "alpha_channel": true,
                "animated": false,
                "game": 202170,
                "height": 800,
                "image_id": "co7yj5",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co7yj5.jpg",
                "width": 600,
                "checksum": "1b110ee9-15c2-8720-f1f0-820f1e014a12"
            },
            "name": "Fallout 3: The Pitt & Fallout 3: Operation Anchorage"
        },
        {
            "id": 122725,
            "cover": {
                "id": 162984,
                "alpha_channel": false,
                "animated": false,
                "game": 122725,
                "height": 800,
                "image_id": "co3hrc",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co3hrc.jpg",
                "width": 600,
                "checksum": "d46071fc-e829-083b-f3b5-2623e5cbfbe6"
            },
            "first_release_date": 1571961600,
            "name": "Fallout: Legacy Collection"
        },
        {
            "id": 25878,
            "cover": {
                "id": 125043,
                "alpha_channel": true,
                "animated": false,
                "game": 25878,
                "height": 720,
                "image_id": "co2ohf",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co2ohf.jpg",
                "width": 540,
                "checksum": "49daafd0-6c13-f2e3-216b-9762142c43b1"
            },
            "first_release_date": 1610668800,
            "name": "Fallout: The Frontier"
        },
        {
            "id": 9630,
            "cover": {
                "id": 91158,
                "alpha_channel": false,
                "animated": false,
                "game": 9630,
                "height": 1473,
                "image_id": "co1yc6",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co1yc6.jpg",
                "width": 1105,
                "checksum": "8ccca309-0f95-f6b4-81d2-64b0ce3b2a71"
            },
            "first_release_date": 1447027200,
            "name": "Fallout 4"
        },
        {
            "id": 15,
            "cover": {
                "id": 91184,
                "alpha_channel": false,
                "animated": false,
                "game": 15,
                "height": 1240,
                "image_id": "co1ycw",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co1ycw.jpg",
                "width": 930,
                "checksum": "68a4869f-9abd-2d97-27a5-c63d73255c97"
            },
            "first_release_date": 1225152000,
            "name": "Fallout 3"
        },
        {
            "id": 281702,
            "cover": {
                "id": 526891,
                "alpha_channel": true,
                "animated": false,
                "game": 281702,
                "height": 800,
                "image_id": "cobajv",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/cobajv.jpg",
                "width": 600,
                "checksum": "adb17549-c40b-ef0a-3623-02159831e192"
            },
            "name": "Fallout: Nuevo Mexico"
        },
        {
            "id": 142745,
            "cover": {
                "id": 125479,
                "alpha_channel": false,
                "animated": false,
                "game": 142745,
                "height": 900,
                "image_id": "co2otj",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co2otj.jpg",
                "width": 675,
                "checksum": "3af004b9-dd47-e2f5-be8c-bcf6aa3a058c"
            },
            "first_release_date": 1540166400,
            "name": "Fallout: New California"
        },
        {
            "id": 131851,
            "cover": {
                "id": 94273,
                "alpha_channel": false,
                "animated": false,
                "game": 131851,
                "height": 1280,
                "image_id": "co20qp",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co20qp.jpg",
                "width": 960,
                "checksum": "92c8f9d6-cdd7-c05c-775c-93a60b9a839b"
            },
            "first_release_date": 1577750400,
            "name": "Fallout Shelter Online"
        },
        {
            "id": 281700,
            "cover": {
                "id": 353899,
                "alpha_channel": true,
                "animated": false,
                "game": 281700,
                "height": 633,
                "image_id": "co7l2j",
                "url": "//images.igdb.com/igdb/image/upload/t_thumb/co7l2j.jpg",
                "width": 416,
                "checksum": "894d6417-6674-ec9a-998a-bce98f5bf1d6"
            },
            "first_release_date": 1676505600,
            "name": "Fallout ZX"
        }],
    consoles: [
        {
            "id": 27,
            "name": "Atari 7800",
            "alias": "atari-7800"
        },
        {
            "id": 40,
            "name": "Commodore 64",
            "alias": "commodore-64"
        },
        {
            "id": 4936,
            "name": "Famicom Disk System",
            "alias": "fds"
        },
        {
            "id": 14,
            "name": "Microsoft Xbox",
            "alias": "microsoft-xbox"
        },
        {
            "id": 15,
            "name": "Microsoft Xbox 360",
            "alias": "microsoft-xbox-360"
        },
        {
            "id": 4920,
            "name": "Microsoft Xbox One",
            "alias": "microsoft-xbox-one"
        },
        {
            "id": 4912,
            "name": "Nintendo 3DS",
            "alias": "nintendo-3ds"
        },
        {
            "id": 4971,
            "name": "Nintendo Switch",
            "alias": "nintendo-switch"
        }
    ]
}

export const eventTestData: IGDBEvent = {
    "id": 294,
    "name": "Into the Infinite: A Level Infinite Showcase",
    "description": "For the first time ever, Level Infinite is bringing a digital gaming showcase to global gamers featuring fresh content from a diverse range of games.\n\nTogether with talented studios and partner brands, the Into the Infinite showcase will feature first-look trailers, updates on existing games, long-awaited announcements, and giveaways!",
    "slug": "into-the-infinite-a-level-infinite-showcase",
    "event_logo": {
        "id": 448,
        "animated": false,
        "image_id": "elcg",
        "url": "//images.igdb.com/igdb/image/upload/t_thumb/elcg.jpg"
    },
    "event_networks": [
        {
            "id": 161376,
            "url": "https://www.youtube.com/@KazeN64",
            "network_type": {
                "id": 3,
                "name": "YouTube"
            }
        },
        {
            "id": 161377,
            "url": "twitch.tv/kazesm64",
            "network_type": {
                "id": 1,
                "name": "Twitch"
            }
        },
        {
            "id": 161378,
            "url": "twitter.com/KazeEmanuar",
            "network_type": {
                "id": 4,
                "name": "Twitter"
            }
        }
    ],
    "start_time": 1692831600,
    "end_time": 1771609896,
    "time_zone": "CST",
    "live_stream_url": "https://www.youtube.com/watch?v=adWKQS_Ju84",
    "games": [
        {
            "id": 36646,
            "cover": {
                "id": 203030,
                "image_id": "co4cnq"
            },
            "name": "GTFO"
        },
        {
            "id": 121751,
            "cover": {
                "id": 233053,
                "image_id": "co4ztp"
            },
            "name": "Synced"
        },
        {
            "id": 135998,
            "cover": {
                "id": 258150,
                "image_id": "co5j6u"
            },
            "name": "Warhammer 40,000: Darktide"
        },
        {
            "id": 174684,
            "cover": {
                "id": 271401,
                "image_id": "co5tex"
            },
            "name": "Arena Breakout"
        },
        {
            "id": 175001,
            "cover": {
                "id": 305038,
                "image_id": "co6jda"
            },
            "name": "Undawn"
        },
        {
            "id": 182190,
            "cover": {
                "id": 198169,
                "image_id": "co48wp"
            },
            "name": "Song of Nunu: A League of Legends Story"
        },
        {
            "id": 185253,
            "cover": {
                "id": 199914,
                "image_id": "co4a96"
            },
            "name": "Dune: Spice Wars"
        },
        {
            "id": 216319,
            "cover": {
                "id": 326043,
                "image_id": "co6zkr"
            },
            "name": "Assassin's Creed Jade"
        },
        {
            "id": 228532,
            "cover": {
                "id": 386640,
                "image_id": "co8ac0"
            },
            "name": "Wayfinder"
        },
        {
            "id": 252849,
            "cover": {
                "id": 308529,
                "image_id": "co6m29"
            },
            "name": "Stampede Racing Royale"
        },
        {
            "id": 254235,
            "cover": {
                "id": 484954,
                "image_id": "coae6y"
            },
            "name": "Tarisland"
        },
        {
            "id": 256912,
            "cover": {
                "id": 325437,
                "image_id": "co6z3x"
            },
            "name": "Command & Conquer: Legions"
        },
        {
            "id": 262186,
            "cover": {
                "id": 478546,
                "image_id": "coa98y"
            },
            "name": "Delta Force"
        },
        {
            "id": 262658,
            "cover": {
                "id": 325493,
                "image_id": "co6z5h"
            },
            "name": "Warhammer: Vermintide 2 - Necromancer"
        }
    ],
    "videos": [
        {
            "id": 44968,
            "game": {
                "id": 121751,
                "cover": {
                    "id": 233053,
                    "image_id": "co4ztp"
                },
                "name": "Synced"
            },
            "name": "Trailer",
            "video_id": "tDpGS2ln19g"
        },
        {
            "id": 59773,
            "game": {
                "id": 182190,
                "cover": {
                    "id": 198169,
                    "image_id": "co48wp"
                },
                "name": "Song of Nunu: A League of Legends Story"
            },
            "name": "Dev Diary",
            "video_id": "9E5BCiqg9Rs"
        },
        {
            "id": 78832,
            "game": {
                "id": 174684,
                "cover": {
                    "id": 271401,
                    "image_id": "co5tex"
                },
                "name": "Arena Breakout"
            },
            "name": "Trailer",
            "video_id": "NPXpaAApGXk"
        },
        {
            "id": 83454,
            "game": {
                "id": 135998,
                "cover": {
                    "id": 258150,
                    "image_id": "co5j6u"
                },
                "name": "Warhammer 40,000: Darktide"
            },
            "name": "Trailer",
            "video_id": "u2wgBNAJx70"
        },
        {
            "id": 84918,
            "game": {
                "id": 228532,
                "cover": {
                    "id": 386640,
                    "image_id": "co8ac0"
                },
                "name": "Wayfinder"
            },
            "name": "Gameplay Trailer",
            "video_id": "8hgv8zdyS5k"
        },
        {
            "id": 90348,
            "game": {
                "id": 175001,
                "cover": {
                    "id": 305038,
                    "image_id": "co6jda"
                },
                "name": "Undawn"
            },
            "name": "Trailer",
            "video_id": "-6wh24Qw-gw"
        },
        {
            "id": 91758,
            "game": {
                "id": 252849,
                "cover": {
                    "id": 308529,
                    "image_id": "co6m29"
                },
                "name": "Stampede Racing Royale"
            },
            "name": "Trailer",
            "video_id": "zVseVsfZyl0"
        },
        {
            "id": 91934,
            "game": {
                "id": 216319,
                "cover": {
                    "id": 326043,
                    "image_id": "co6zkr"
                },
                "name": "Assassin's Creed Jade"
            },
            "name": "Announcement Trailer",
            "video_id": "pfJw0zBEyjE"
        },
        {
            "id": 92297,
            "game": {
                "id": 254235,
                "cover": {
                    "id": 484954,
                    "image_id": "coae6y"
                },
                "name": "Tarisland"
            },
            "name": "Trailer",
            "video_id": "lsr22HuWVN4"
        },
        {
            "id": 95974,
            "game": {
                "id": 262186,
                "cover": {
                    "id": 478546,
                    "image_id": "coa98y"
                },
                "name": "Delta Force"
            },
            "name": "Teaser",
            "video_id": "0SWMqANp8T0"
        },
        {
            "id": 96370,
            "game": {
                "id": 262658,
                "cover": {
                    "id": 325493,
                    "image_id": "co6z5h"
                },
                "name": "Warhammer: Vermintide 2 - Necromancer"
            },
            "name": "Trailer",
            "video_id": "e-fuHaH_Ji4"
        }
    ],
    "created_at": 1692693606,
    "updated_at": 1734511395,
    "checksum": "43d53d05-4465-8f41-c736-6855bbd9148c"
}